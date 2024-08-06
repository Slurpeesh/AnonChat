import { useAppDispatch, useAppSelector } from '@/app/hooks/useActions'
import { cn } from '@/app/lib/utils'
import { socket } from '@/app/socket'
import { setReply } from '@/app/store/slices/replySlice'
import { AnimatePresence, motion } from 'framer-motion'
import { Reply, X } from 'lucide-react'
import { FormEvent, MutableRefObject, useEffect, useRef, useState } from 'react'

interface IMyForm {
  scrollableMessages: MutableRefObject<any>
  className?: string
}

export function MyForm({ scrollableMessages, className }: IMyForm) {
  const [value, setValue] = useState('')
  const messages = useAppSelector((state) => state.messages.value)
  const reply = useAppSelector((state) => state.reply.value)
  const dispatch = useAppDispatch()
  const previousMessageCount = useRef(messages.length)

  useEffect(() => {
    let isLastMessageRepliedByMe: boolean = false
    if (messages.length !== 0) {
      const lastMessage = messages[messages.length - 1]
      const isReplied = lastMessage.reply !== undefined
      if (isReplied) {
        isLastMessageRepliedByMe =
          Object.keys(lastMessage.reply).length !== 0 && lastMessage.me
      }
    }
    const isAtBottom =
      Math.abs(
        scrollableMessages.current.scrollHeight -
          scrollableMessages.current.scrollTop -
          scrollableMessages.current.clientHeight
      ) < 100
    if (
      (previousMessageCount.current < messages.length && isAtBottom) ||
      isLastMessageRepliedByMe
    ) {
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
      setTimeout(() => {
        dispatch(setReply({}))
      })
    }
  }

  function onCancelReply() {
    dispatch(setReply({}))
  }

  return (
    <form
      className={cn(
        'flex flex-col justify-center items-center gap-2 w-2/5',
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
            className="flex justify-between items-center w-full gap-5 bg-muted/20 rounded-lg p-2 text-sm"
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
              onClick={() => onCancelReply()}
              className="rounded-full hover:bg-muted/20 p-1 transition-colors"
            >
              <X className="stroke-danger" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between gap-5 w-full">
        <input
          className="rounded-lg px-1 w-full bg-background-section"
          value={value}
          placeholder="Write a message"
          onChange={(e) => setValue(e.target.value)}
        />

        <button
          className="p-2 bg-accent hover:bg-accent-hover rounded-md transition-colors"
          type="submit"
        >
          Submit
        </button>
      </div>
    </form>
  )
}
