import { useAppDispatch, useAppSelector } from '@/app/hooks/useActions'
import { cn } from '@/app/lib/utils'
import { socket } from '@/app/socket'
import { setReply } from '@/app/store/slices/replySlice'
import { AnimatePresence, motion } from 'framer-motion'
import { Reply, X } from 'lucide-react'
import {
  FormEvent,
  forwardRef,
  MouseEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import MotionSendHorizontal from './MotionSendHorizontal'

interface IMyForm {
  scrollableMessages: MutableRefObject<any>
  className?: string
}
const Form = forwardRef(function Form(
  { scrollableMessages, className }: IMyForm,
  ref: MutableRefObject<any>
) {
  const [value, setValue] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const messages = useAppSelector((state) => state.messages.value)
  const reply = useAppSelector((state) => state.reply.value)
  const isConnected = useAppSelector((state) => state.isConnected.value)
  const isWaiting = useAppSelector((state) => state.isWaiting.value)
  const isScrollAtBottom = useAppSelector(
    (state) => state.isScrollAtBottom.value
  )
  const dispatch = useAppDispatch()
  const previousMessageCount = useRef(messages.length)

  const sendButtonVariants = {
    hover: {
      rotate: [0, 10, -10, 0],
      scale: 1.1,
    },
    initial: { rotate: 0, scale: 1 },
  }

  useEffect(() => {
    if (previousMessageCount.current < messages.length && isScrollAtBottom) {
      scrollableMessages.current.scrollTop =
        scrollableMessages.current.scrollHeight
    }
    previousMessageCount.current = messages.length
  }, [messages])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setValue('')
    if (value.trim()) {
      socket.emit('createMessage', value, reply)
      scrollableMessages.current.scrollTop =
        scrollableMessages.current.scrollHeight
    }
  }

  useEffect(() => {
    setTimeout(() => {
      ref.current.focus()
    })
  }, [reply])

  function onCancelReply(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    dispatch(setReply({}))
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
        className
      )}
      onSubmit={onSubmit}
    >
      <AnimatePresence>
        {Object.keys(reply).length !== 0 && (
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
                <span className="font-semibold">{reply.author}: </span>
                {reply.value.length > 70
                  ? reply.value.slice(0, 70) + '...'
                  : reply.value}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => onCancelReply(e)}
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
          ref={ref}
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
            variants={sendButtonVariants}
            animate={isHovered ? 'hover' : 'initial'}
            transition={{ duration: 0.25 }}
            className="stroke-foreground ml-auto"
          />
        </button>
      </div>
    </form>
  )
})

export default Form
