import { useAppDispatch, useAppSelector } from '@/app/hooks/useActions'
import { cn, MESSAGE_HIGHLIGHT_DURATION } from '@/app/lib/utils'
import { markAsRead, setIsHighlighted } from '@/app/store/slices/messagesSlice'
import aud from '@/assets/sounds/alert.mp3'
import BackToBottomButton from '@/entities/BackToBottomButton/BackToBottomButton'
import { MessageGroup } from '@/entities/Message'
import { ScrollArea } from '@/shared/ScrollArea'
import { AnimatePresence } from 'motion/react'
import { UIEvent, useCallback, useEffect, useRef, useState } from 'react'
import ChatMessage from './ChatMessage'

interface IMessages {
  className?: string
}

export default function Messages({ className }: IMessages) {
  const messages = useAppSelector((state) => state.messages.value)
  const dispatch = useAppDispatch()
  const [isScrollAtBottom, setIsScrollAtBottom] = useState(true)
  const isScrollAtBottomRef = useRef(isScrollAtBottom)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(messages.length)
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
    isScrollAtBottomRef.current = isScrollAtBottom
  }, [isScrollAtBottom])

  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      const lastMessage = messages.at(-1)

      if (lastMessage === undefined) {
        throw new Error('Last message cannot be undefined')
      }

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
        alertSound.play().catch((reason) => {
          console.error(reason)
        })
      }
    }
    prevCountRef.current = messages.length
  }, [messages])

  const markVisibleMessagesRead = useCallback(() => {
    if (document.hidden) return

    const scrollArea = scrollRef.current
    if (!scrollArea) return

    const hasUnread = messages.some((msg) => !msg.isRead)
    if (!hasUnread) return

    const scrollAreaRect = scrollArea.getBoundingClientRect()

    let lastVisibleIndex = -1

    messages.forEach((message, index) => {
      if (message.isRead) return

      const messageElement = document.getElementById(`message-${message.id}`)
      if (!messageElement) return

      const messageRect = messageElement.getBoundingClientRect()

      const visibleTop = Math.max(messageRect.top, scrollAreaRect.top)
      const visibleBottom = Math.min(messageRect.bottom, scrollAreaRect.bottom)
      const visibleHeight = Math.max(0, visibleBottom - visibleTop)
      const visibleRatio = visibleHeight / messageRect.height

      if (visibleRatio >= 0.5) {
        lastVisibleIndex = index
      }
    })

    if (lastVisibleIndex < 0) return

    const idsToMark: string[] = []
    for (let i = 0; i <= lastVisibleIndex; i++) {
      const message = messages[i]
      if (message && !message.isRead) {
        idsToMark.push(message.id)
      }
    }

    if (idsToMark.length > 0) {
      dispatch(markAsRead(idsToMark))
    }
  }, [messages, dispatch])

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

    setTimeout(() => {
      messageElement.scrollIntoView({ behavior: 'smooth' })
    })
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
      className={cn('w-full md:w-2/3 max-h-[55dvh] rounded-md px-4', className)}
    >
      <MessageGroup>
        {messages.map((message, index, arr) => {
          return (
            <ChatMessage
              key={message.id}
              message={message}
              isLastMessage={index === arr.length - 1}
              onMessageReply={onMessageReply}
            />
          )
        })}
      </MessageGroup>
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
