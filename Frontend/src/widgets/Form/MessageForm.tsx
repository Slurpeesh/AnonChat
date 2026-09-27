import { useAppDispatch, useAppSelector } from '@/app/hooks/useActions'
import {
  cn,
  MESSAGE_AUTHOR_DIVIDER,
  MESSAGE_AUTHOR_ME,
  MESSAGE_AUTHOR_OTHER,
} from '@/app/lib/utils'
import { socket } from '@/app/socket'
import { setReply } from '@/app/store/slices/replySlice'
import { Textarea } from '@/shared/Textarea'
import { Reply, X } from 'lucide-react'
import { AnimatePresence, motion, Variants } from 'motion/react'
import {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import MotionSendHorizontal from './MotionSendHorizontal'

const SEND_BUTTON_VARIANTS: Variants = {
  hover: {
    rotate: [0, 10, -10, 0],
    scale: 1.1,
  },
  initial: { rotate: 0, scale: 1 },
}

interface IMessageForm {
  className?: string
}

export default function MessageForm({ className }: IMessageForm) {
  const reply = useAppSelector((state) => state.reply.value)
  const isConnected = useAppSelector((state) => state.isConnected.value)
  const isWaiting = useAppSelector((state) => state.isWaiting.value)
  const dispatch = useAppDispatch()
  const [value, setValue] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current !== null) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [reply])

  function submitMessage() {
    const trimmedValue = value.trim()
    if (trimmedValue === '') return

    stopTyping()
    dispatch(setReply(null))
    setValue('')
    socket.emit('createMessage', trimmedValue, reply)
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    submitMessage()
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitMessage()
    }
  }

  function onCancelReply() {
    dispatch(setReply(null))
  }

  function notifyTyping() {
    socket.emit('typing', true)

    if (typingTimeoutRef.current !== null) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', false)
    }, 2000)
  }

  function stopTyping() {
    if (typingTimeoutRef.current !== null) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    socket.emit('typing', false)
  }

  function onValueChanged(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const curentValue = e.target.value
    setValue(e.target.value)

    if (curentValue.trim() === '') {
      stopTyping()
    } else {
      notifyTyping()
    }
  }

  function onMouseEnterSendButton() {
    setIsHovered(true)
  }

  function onMouseLeaveSendButton() {
    setIsHovered(false)
  }

  return (
    <form
      className={cn(
        'flex flex-col justify-end items-center gap-2 w-full sm:w-4/5 lg:w-2/5',
        className,
      )}
      onSubmit={onSubmit}
    >
      <AnimatePresence>
        {reply !== null && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ x: 250, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0 }}
            className="flex justify-between items-center w-full gap-5 bg-background-section/90 rounded-lg p-2 text-sm"
          >
            <div className="flex justify-center items-center gap-2">
              <Reply className="size-4 shrink-0" />
              <p className="line-clamp-2 wrap-anywhere">
                <span className="font-semibold">
                  {(reply.isRepliedMessageMine
                    ? MESSAGE_AUTHOR_ME
                    : MESSAGE_AUTHOR_OTHER) + MESSAGE_AUTHOR_DIVIDER}
                </span>
                {reply.value}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onCancelReply()}
              className="rounded-full hover:bg-muted/20 p-1 transition-colors"
              aria-label="Cancel reply"
            >
              <X className="stroke-danger" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between gap-5 w-full">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onValueChanged(e)}
          onKeyDown={(e) => onKeyDown(e)}
          placeholder="Write a message"
          disabled={!isConnected || isWaiting}
          rows={1}
          className="resize-none overflow-hidden"
        />

        <button
          onMouseEnter={() => onMouseEnterSendButton()}
          onMouseLeave={() => onMouseLeaveSendButton()}
          className="p-2 sm:px-6 bg-accent hover:bg-accent-hover rounded-md transition-colors"
          type="submit"
          aria-label="Send message"
        >
          <MotionSendHorizontal
            variants={SEND_BUTTON_VARIANTS}
            animate={isHovered ? 'hover' : 'initial'}
            transition={{ duration: 0.25 }}
            className="stroke-foreground ml-auto"
          />
        </button>
      </div>
    </form>
  )
}
