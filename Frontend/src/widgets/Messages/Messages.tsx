import { useAppDispatch, useAppSelector } from '@/app/hooks/useActions'
import { cn } from '@/app/lib/utils'
import { setIsScrollAtBottom } from '@/app/store/slices/isScrollAtBottom'
import { setAlerted, setCopied } from '@/app/store/slices/messagesSlice'
import { setReply } from '@/app/store/slices/replySlice'
import BackToBottomButton from '@/entities/BackToBottomButton/BackToBottomButton'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/shared/ContextMenu/ContextMenu'
import { ScrollArea } from '@/shared/ScrollArea/ScrollArea'
import { AnimatePresence, motion, PanInfo } from 'framer-motion'
import { Copy, CopyCheck, Reply } from 'lucide-react'
import {
  forwardRef,
  MouseEvent,
  MutableRefObject,
  PointerEvent,
  RefObject,
  UIEvent,
  useRef,
} from 'react'

interface IMessages {
  className?: string
}

const Messages = forwardRef(function Messages(
  { className }: IMessages,
  ref: RefObject<HTMLDivElement>
) {
  const messages = useAppSelector((state) => state.messages.value)
  const isScrollAtBottom = useAppSelector(
    (state) => state.isScrollAtBottom.value
  )
  const dispatch = useAppDispatch()
  const copyTimeoutID: MutableRefObject<ReturnType<typeof setTimeout>> =
    useRef(undefined)
  const pointedDownMessage: MutableRefObject<HTMLElement> = useRef(null)

  function replySelectHandler(e: Event) {
    const customEvent = e as CustomEvent
    const target = customEvent.currentTarget as HTMLElement
    const dataKey = Number(target.getAttribute('data-key'))
    const dataMe = target.getAttribute('data-me') === 'true'
    const author = dataMe ? 'Me' : 'Stranger'
    const value = messages[dataKey].value
    dispatch(setReply({ author, value, id: dataKey }))
  }

  function copySelectHandler(e: Event) {
    e.preventDefault()
    const customEvent = e as CustomEvent
    const target = customEvent.currentTarget as HTMLElement
    const dataKey = Number(target.getAttribute('data-key'))
    navigator.clipboard.writeText(messages[dataKey].value)
    dispatch(setCopied({ id: dataKey, state: true }))
    if (copyTimeoutID.current) {
      clearTimeout(copyTimeoutID.current)
    }
    copyTimeoutID.current = setTimeout(
      () => dispatch(setCopied({ id: dataKey, state: false })),
      3000
    )
  }

  function messageReplyHandler(e: MouseEvent<HTMLButtonElement>) {
    const target = e.currentTarget as HTMLElement
    const dataId = Number(target.getAttribute('data-reply-id'))
    const messageElement = document.querySelectorAll('li[data-message-id]')[
      dataId
    ]
    dispatch(setAlerted({ id: dataId, state: false }))
    setTimeout(() => {
      messageElement.scrollIntoView({ behavior: 'smooth' })
    })
    setTimeout(() => {
      dispatch(setAlerted({ id: dataId, state: true }))
    }, 3000)
  }

  function onPointerDownMessageHandler(e: PointerEvent<HTMLLIElement>) {
    const messageElement = e.currentTarget as HTMLElement
    const checkLiElem = messageElement.getAttribute('data-me') === 'true'
    if (checkLiElem !== null) {
      pointedDownMessage.current = messageElement
    }
  }

  function onDragEndHandler(
    e: globalThis.MouseEvent | globalThis.PointerEvent | TouchEvent,
    info: PanInfo
  ) {
    const messageElement = pointedDownMessage.current
    if (messageElement === null) return
    const dataMe = messageElement.getAttribute('data-me') === 'true'
    if (dataMe) {
      if (info.offset.x < -200) {
        const dataKey = Number(messageElement.getAttribute('data-message-id'))
        const author = dataMe ? 'Me' : 'Stranger'
        const value = messages[dataKey].value
        dispatch(setReply({ author, value, id: dataKey }))
      }
    } else {
      if (info.offset.x > 200) {
        const dataKey = Number(messageElement.getAttribute('data-message-id'))
        const author = dataMe ? 'Me' : 'Stranger'
        const value = messages[dataKey].value
        dispatch(setReply({ author, value, id: dataKey }))
      }
    }
    pointedDownMessage.current = null
  }

  function onScrollHandler(e: UIEvent<HTMLDivElement>) {
    const isAtBottom =
      Math.abs(
        e.currentTarget.scrollHeight -
          e.currentTarget.scrollTop -
          e.currentTarget.clientHeight
      ) < 100
    if (isAtBottom) {
      if (!isScrollAtBottom) {
        dispatch(setIsScrollAtBottom(true))
      }
    } else {
      if (isScrollAtBottom) {
        dispatch(setIsScrollAtBottom(false))
      }
    }
  }

  function backToBottomHandler() {
    ref.current.scrollTop = ref.current.scrollHeight
  }

  return (
    <ScrollArea
      ref={ref}
      onScroll={(e) => onScrollHandler(e)}
      className={cn('w-full md:w-2/3 max-h-[55dvh] rounded-md px-4', className)}
    >
      <ul>
        {messages.map((message, index, arr) => {
          const isLastMessage = index === arr.length - 1
          const isReplied = Object.keys(message.reply).length !== 0
          const animation = message.me ? { x: [50, 0] } : { x: [-50, 0] }
          const messageClassName = cn(
            'p-2 my-2 rounded-lg w-2/3 break-all transition-colors delay-300 duration-[3000ms]',
            {
              'order-first': !message.me,
              'bg-alert': !message.alerted,
              'bg-background-section': message.alerted,
            }
          )

          return (
            <div className="flex justify-between items-center" key={index}>
              <Reply
                className={cn('stroke-muted', {
                  '-scale-x-100': !message.me,
                })}
              />
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <motion.li
                    drag="x"
                    dragSnapToOrigin
                    dragConstraints={
                      message.me
                        ? { left: -150, right: 0 }
                        : { left: 0, right: 150 }
                    }
                    dragElastic={0.06}
                    onDragEnd={(e, info) => onDragEndHandler(e, info)}
                    onPointerDown={(e) => onPointerDownMessageHandler(e)}
                    data-message-id={index}
                    data-me={message.me}
                    initial={{ x: 0 }}
                    animate={isLastMessage ? animation : {}}
                    className={messageClassName}
                  >
                    {isReplied && (
                      <button
                        onClick={(e) => messageReplyHandler(e)}
                        className="flex flex-col text-accent border-l border-accent pl-2 text-sm w-full"
                        data-reply-id={message.reply.id}
                      >
                        <Reply className="w-4 h-4" />
                        <div className="break-all text-left">
                          <span className="font-semibold">
                            {message.reply.author + ': '}
                          </span>
                          <span>{message.reply.value}</span>
                        </div>
                      </button>
                    )}
                    <span className="font-semibold">
                      {message.me ? 'Me: ' : 'Stranger: '}
                    </span>
                    {message.value}
                  </motion.li>
                </ContextMenuTrigger>
                <ContextMenuContent className="text-foreground">
                  <ContextMenuItem
                    data-key={index}
                    data-me={message.me}
                    className="flex items-center gap-2"
                    onSelect={(e) => replySelectHandler(e)}
                  >
                    <Reply />
                    <p>Reply</p>
                  </ContextMenuItem>
                  <ContextMenuItem
                    data-key={index}
                    data-me={message.me}
                    className="flex items-center gap-2"
                    onSelect={(e) => copySelectHandler(e)}
                  >
                    {message.copied ? (
                      <>
                        <CopyCheck />
                        <p>Copied</p>
                      </>
                    ) : (
                      <>
                        <Copy />
                        <p>Copy</p>
                      </>
                    )}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          )
        })}
      </ul>
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
})

export default Messages
