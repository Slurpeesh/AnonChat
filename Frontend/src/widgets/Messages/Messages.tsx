import { useAppDispatch, useAppSelector } from '@/app/hooks/useActions'
import { cn, MESSAGE_HIGHLIGHT_DURATION } from '@/app/lib/utils'
import { selectLastMessage } from '@/app/store'
import {
  markAsRead,
  setIsHighlighted,
} from '@/app/store/slices/messageGroupsSlice'
import aud from '@/assets/sounds/alert.mp3'
import BackToBottomButton from '@/entities/BackToBottomButton/BackToBottomButton'
import { MessageGroup } from '@/entities/Message'
import { ScrollArea } from '@/shared/ScrollArea'
import { AnimatePresence } from 'motion/react'
import { UIEvent, useCallback, useEffect, useRef, useState } from 'react'
import ChatMessage from './ChatMessage'

interface IMessagesProps {
  className?: string
}

export default function Messages({ className }: IMessagesProps) {
  const messageGroups = useAppSelector((state) => state.messageGroups.value)
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

  useEffect(() => {
    return () => {
      Object.values(highlightedTimeoutsRef.current).forEach((timeout) => {
        clearTimeout(timeout)
      })
      highlightedTimeoutsRef.current = {}
    }
  }, [])

  useEffect(() => {
    if (!lastMessage) return
    if (lastMessage.id === prevLastMessageIdRef.current) return
    prevLastMessageIdRef.current = lastMessage.id

    const isLastMessageFromMe = lastMessage.isMine
    const isScrollAtBottom = isScrollAtBottomRef.current

    if (isLastMessageFromMe || isScrollAtBottom) {
      const scroll = scrollRef.current
      if (scroll) scroll.scrollTop = scroll.scrollHeight
    }

    if (!isLastMessageFromMe && (document.hidden || !isScrollAtBottom)) {
      const alertSound = alertSoundRef.current
      if (alertSound === null) {
        throw new Error('Alert sound is not initialized')
      }
      alertSound.pause()
      alertSound.currentTime = 0
      alertSound.play().catch((reason) => console.error(reason))
    }
  }, [lastMessage])

  const markVisibleMessagesRead = useCallback(() => {
    if (document.hidden) return

    const scrollArea = scrollRef.current
    if (!scrollArea) return

    const scrollAreaRect = scrollArea.getBoundingClientRect()
    let lastVisibleId: string | null = null
    let foundUnread = false

    for (const group of messageGroups) {
      for (const message of group.messages) {
        if (message.isRead) continue
        foundUnread = true

        const el = document.getElementById(`message-${message.id}`)
        if (!el) continue

        const rect = el.getBoundingClientRect()
        const visibleTop = Math.max(rect.top, scrollAreaRect.top)
        const visibleBottom = Math.min(rect.bottom, scrollAreaRect.bottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        if (visibleHeight / rect.height >= 0.5) {
          lastVisibleId = message.id
        }
      }
    }

    if (!foundUnread) return
    if (!lastVisibleId) return

    const idsToMark: string[] = []
    for (const group of messageGroups) {
      for (const message of group.messages) {
        if (!message.isRead) idsToMark.push(message.id)
        if (message.id === lastVisibleId) {
          dispatch(markAsRead(idsToMark))
          return
        }
      }
    }
  }, [messageGroups, dispatch])

  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) return
      markVisibleMessagesRead()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [markVisibleMessagesRead])

  const onMessageReply = useCallback((repliedMessageId: string) => {
    const messageElement = document.getElementById(
      `message-${repliedMessageId}`,
    )
    if (messageElement === null) return

    const existingTimeout = highlightedTimeoutsRef.current[repliedMessageId]
    if (existingTimeout !== undefined) {
      clearTimeout(existingTimeout)
    }

    dispatch(setIsHighlighted({ id: repliedMessageId, state: true }))

    messageElement.scrollIntoView({ behavior: 'smooth' })

    highlightedTimeoutsRef.current[repliedMessageId] = setTimeout(() => {
      dispatch(setIsHighlighted({ id: repliedMessageId, state: false }))
      delete highlightedTimeoutsRef.current[repliedMessageId]
    }, MESSAGE_HIGHLIGHT_DURATION)
  }, [])

  function onScrollHandler(e: UIEvent<HTMLDivElement>) {
    const isAtBottom =
      Math.abs(
        e.currentTarget.scrollHeight -
          e.currentTarget.scrollTop -
          e.currentTarget.clientHeight,
      ) < 100

    isScrollAtBottomRef.current = isAtBottom
    if (isAtBottom !== isScrollAtBottom) {
      setIsScrollAtBottom(isAtBottom)
    }

    markVisibleMessagesRead()
  }

  function backToBottomHandler() {
    const scroll = scrollRef.current
    if (!scroll) return

    scroll.scrollTop = scroll.scrollHeight
  }

  return (
    <ScrollArea
      ref={scrollRef}
      onScroll={(e) => onScrollHandler(e)}
      className={cn(
        'w-full md:max-w-3xl max-h-[55dvh] rounded-md px-4',
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        {messageGroups.map((group) => (
          <MessageGroup key={group.id} className="gap-2">
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
  )
}
