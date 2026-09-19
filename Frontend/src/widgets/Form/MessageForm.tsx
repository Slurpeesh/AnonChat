import { useAppDispatch, useAppSelector } from '@/app/hooks/useActions'
import { cn, MESSAGE_AUTHOR_ME, MESSAGE_AUTHOR_OTHER } from '@/app/lib/utils'
import { socket } from '@/app/socket'
import { setReply } from '@/app/store/slices/replySlice'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Reply, X } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import MotionSendHorizontal from './MotionSendHorizontal'

const SEND_BUTTON_VARIANTS: Variants = {
  hover: {
    rotate: [0, 10, -10, 0],
    scale: 1.1,
  },
  initial: { rotate: 0, scale: 1 },
}
const REPLY_MAX_LENGTH = 70

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
  const inputRef = useRef<HTMLInputElement>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedValue = value.trim()
    if (trimmedValue === '') return

    dispatch(setReply(null))
    setValue('')
    socket.emit('createMessage', trimmedValue, reply)
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [reply])

  function onCancelReply() {
    dispatch(setReply(null))
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
              <Reply />
              <p className="break-all">
                <span className="font-semibold">
                  {(reply.isRepliedMessageMine
                    ? MESSAGE_AUTHOR_ME
                    : MESSAGE_AUTHOR_OTHER) + ': '}
                </span>
                {reply.value.length > REPLY_MAX_LENGTH
                  ? reply.value.slice(0, REPLY_MAX_LENGTH) + '…'
                  : reply.value}
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
        <input
          ref={inputRef}
          className="rounded-lg px-2 w-full bg-background-section"
          value={value}
          placeholder="Write a message"
          onChange={(e) => setValue(e.target.value)}
          disabled={!isConnected || isWaiting}
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
