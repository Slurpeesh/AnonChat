import { useAppDispatch, useAppSelector } from '@/app/hooks/useActions'
import { cn, MESSAGE_HIGHLIGHT_DURATION } from '@/app/lib/utils'
import { selectLastMessage } from '@/app/store'
import { setIsHighlighted } from '@/app/store/slices/messageGroupsSlice'
import aud from '@/assets/sounds/alert.mp3'
import BackToBottomButton from '@/entities/BackToBottomButton/BackToBottomButton'
import { MessageGroup } from '@/entities/Message'
import { ScrollArea } from '@/shared/ScrollArea'
import { AnimatePresence } from 'motion/react'
import { UIEvent, useCallback, useEffect, useRef, useState } from 'react'
import ChatMessage from './ChatMessage'

interface IMessagesProps {
  markAsReadByMe: (idsToMark: string[]) => void
  className?: string
}

export default function Messages({
  className,
  markAsReadByMe,
}: IMessagesProps) {
  const messageGroups = useAppSelector((state) => state.messageGroups.value)
  const isTyping = useAppSelector((state) => state.isTyping.value)
  const lastMessage = useAppSelector(selectLastMessage)
  const dispatch = useAppDispatch()
  const [isScrollAtBottom, setIsScrollAtBottom] = useState(true)
  const isScrollAtBottomRef = useRef(isScrollAtBottom)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevLastMessageIdRef = useRef<string | null>(null)
  const highlightedTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({})
  const alertSoundRef = useRef<HTMLAudioElement | null>(null)
  if (alertSoundRef.current === null) {
    alertSoundRef.current = new Audio(aud)
  }

  // these refs are used to avoid stale closures in the callbacks below and to avoid unnecessary re-renders when the state changes
  const messageGroupsRef = useRef(messageGroups)
  messageGroupsRef.current = messageGroups
  const markAsReadByMeRef = useRef(markAsReadByMe)
  markAsReadByMeRef.current = markAsReadByMe

  const observerRef = useRef<IntersectionObserver | null>(null)
  const observedIdsRef = useRef<Set<string>>(new Set())
  const visibleIdsRef = useRef<Set<string>>(new Set())
  const lastMarkedIdRef = useRef<string | null>(null)

  const markAsReadUpTo = useCallback((lastVisibleId: string) => {
    if (document.hidden) return
    if (lastVisibleId === lastMarkedIdRef.current) return

    const groups = messageGroupsRef.current
    const idsToMark: string[] = []
    let isLastVisibleIdFound = false

    for (const group of groups) {
      for (const message of group.messages) {
        if (!message.isRead) idsToMark.push(message.id)
        if (message.id === lastVisibleId) {
          isLastVisibleIdFound = true
          break
        }
      }
      if (isLastVisibleIdFound) break
    }

    if (!isLastVisibleIdFound) return
    lastMarkedIdRef.current = lastVisibleId
    if (idsToMark.length > 0) markAsReadByMeRef.current(idsToMark)
  }, [])

  const markLastVisibleFromSet = useCallback(() => {
    const visible = visibleIdsRef.current
    if (visible.size === 0) return

    const groups = messageGroupsRef.current
    for (let g = groups.length - 1; g >= 0; g--) {
      const group = groups[g]
      if (!group) continue

      const messages = group.messages

      for (let m = messages.length - 1; m >= 0; m--) {
        const message = messages[m]
        if (!message) continue

        const id = message.id
        if (visible.has(id)) {
          markAsReadUpTo(id)
          return
        }
      }
    }
  }, [markAsReadUpTo])

  /**
   * this is needed only for visibilitychange: observer does not work on a hidden tab.
   * we go only through unread messages.
   */
  const recalcVisibleIds = useCallback(() => {
    const scrollArea = scrollRef.current
    if (!scrollArea) return

    const scrollAreaRect = scrollArea.getBoundingClientRect()
    const groups = messageGroupsRef.current
    const next = new Set<string>()

    for (const group of groups) {
      for (const message of group.messages) {
        if (message.isRead) continue

        const el = document.getElementById(`message-${message.id}`)
        if (!el) continue

        const rect = el.getBoundingClientRect()
        const visibleTop = Math.max(rect.top, scrollAreaRect.top)
        const visibleBottom = Math.min(rect.bottom, scrollAreaRect.bottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)

        if (visibleHeight / rect.height >= 0.5) {
          next.add(message.id)
        }
      }
    }

    visibleIdsRef.current = next
    markLastVisibleFromSet()
  }, [markLastVisibleFromSet])

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.messageId
          if (!id) continue

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            visibleIdsRef.current.add(id)
          } else {
            visibleIdsRef.current.delete(id)
          }
        }
        markLastVisibleFromSet()
      },
      { root, threshold: [0, 0.5] },
    )

    observerRef.current = observer

    return () => {
      observer.disconnect()
      observerRef.current = null
      observedIdsRef.current.clear()
      visibleIdsRef.current.clear()
    }
  }, [markLastVisibleFromSet])

  // subscribe/unsubscribe to messages elements
  useEffect(() => {
    const observer = observerRef.current
    const root = scrollRef.current
    if (!observer || !root) return

    const currentNodeIds = new Set<string>()
    const nodes = root.querySelectorAll<HTMLElement>('[data-message-id]')

    nodes.forEach((node) => {
      const id = node.dataset.messageId
      if (!id) return
      currentNodeIds.add(id)
      if (!observedIdsRef.current.has(id)) {
        observer.observe(node)
        observedIdsRef.current.add(id)
      }
    })

    // unsubscribe from nodes that are no longer visible
    for (const id of observedIdsRef.current) {
      if (currentNodeIds.has(id)) continue
      const node = root.querySelector<HTMLElement>(`[data-message-id="${id}"]`)
      if (node) observer.unobserve(node)
      observedIdsRef.current.delete(id)
      visibleIdsRef.current.delete(id)
    }
  }, [messageGroups])

  useEffect(() => {
    if (messageGroups.length === 0) {
      lastMarkedIdRef.current = null
    }
  }, [messageGroups.length])

  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) return
      recalcVisibleIds()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [recalcVisibleIds])

  useEffect(() => {
    if (!lastMessage) return
    if (lastMessage.id === prevLastMessageIdRef.current) return
    prevLastMessageIdRef.current = lastMessage.id

    const isLastMessageFromMe = lastMessage.isMine
    const isAtBottom = isScrollAtBottomRef.current

    if (isLastMessageFromMe || isAtBottom) {
      const scroll = scrollRef.current
      if (scroll) scroll.scrollTop = scroll.scrollHeight
    }

    if (!isLastMessageFromMe && (document.hidden || !isAtBottom)) {
      const alertSound = alertSoundRef.current
      if (alertSound === null) throw new Error('Alert sound is not initialized')
      alertSound.pause()
      alertSound.currentTime = 0
      alertSound.play().catch((reason) => console.error(reason))
    }
  }, [lastMessage])

  const onMessageReply = useCallback(
    (repliedMessageId: string) => {
      const messageElement = document.getElementById(
        `message-${repliedMessageId}`,
      )
      if (messageElement === null) return

      const existingTimeout = highlightedTimeoutsRef.current[repliedMessageId]
      if (existingTimeout !== undefined) clearTimeout(existingTimeout)

      dispatch(setIsHighlighted({ id: repliedMessageId, state: true }))
      messageElement.scrollIntoView({ behavior: 'smooth' })

      highlightedTimeoutsRef.current[repliedMessageId] = setTimeout(() => {
        dispatch(setIsHighlighted({ id: repliedMessageId, state: false }))
        delete highlightedTimeoutsRef.current[repliedMessageId]
      }, MESSAGE_HIGHLIGHT_DURATION)
    },
    [dispatch],
  )

  function onScrollHandler(e: UIEvent<HTMLDivElement>) {
    const isAtBottom =
      Math.abs(
        e.currentTarget.scrollHeight -
          e.currentTarget.scrollTop -
          e.currentTarget.clientHeight,
      ) < 100

    isScrollAtBottomRef.current = isAtBottom
    if (isAtBottom !== isScrollAtBottom) setIsScrollAtBottom(isAtBottom)
  }

  function backToBottomHandler() {
    const scroll = scrollRef.current
    if (!scroll) return
    scroll.scrollTop = scroll.scrollHeight
  }

  // Cleanup подсветок
  useEffect(() => {
    return () => {
      Object.values(highlightedTimeoutsRef.current).forEach((timeout) => {
        clearTimeout(timeout)
      })
      highlightedTimeoutsRef.current = {}
    }
  }, [])

  return (
    <div className={cn('flex flex-col items-center grow min-h-0', className)}>
      <ScrollArea
        ref={scrollRef}
        onScroll={onScrollHandler}
        className="grow w-full md:max-w-3xl min-h-0 rounded-md"
      >
        <div className="flex flex-col gap-8 px-6">
          {messageGroups.map((group) => (
            <MessageGroup key={group.id} className="gap-4">
              {group.messages.map((message, index) => {
                const isLastInGroup = index === group.messages.length - 1
                const isLastOverall =
                  group.id === messageGroups[messageGroups.length - 1]?.id &&
                  isLastInGroup

                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLastMessage={isLastOverall}
                    isFirstInGroup={index === 0}
                    onMessageReply={onMessageReply}
                  />
                )
              })}
            </MessageGroup>
          ))}
        </div>
        <AnimatePresence>
          {!isScrollAtBottom && (
            <BackToBottomButton
              initial={{ x: 60 }}
              animate={{ x: [60, 0] }}
              exit={{ x: 60 }}
              onClick={() => backToBottomHandler()}
            />
          )}
        </AnimatePresence>
      </ScrollArea>
      <div className="flex justify-center items-baseline-last shrink-0 gap-1 w-full md:max-w-3xl h-8 py-2 text-foreground/90 animate-pulse">
        {isTyping && (
          <>
            <span className="text-sm">Stranger typing</span>
            <span className="size-1 rounded-full bg-foreground/75 animate-bounce [animation-delay:0ms]" />
            <span className="size-1 rounded-full bg-foreground/75 animate-bounce [animation-delay:150ms]" />
            <span className="size-1 rounded-full bg-foreground/75 animate-bounce [animation-delay:300ms]" />
          </>
        )}
      </div>
    </div>
  )
}
