import { useAppDispatch } from '@/app/hooks/useActions'
import {
  cn,
  MESSAGE_ALERT_DURATION,
  MESSAGE_AUTHOR_ME,
  MESSAGE_AUTHOR_OTHER,
} from '@/app/lib/utils'
import { setIsCopied } from '@/app/store/slices/messagesSlice'
import { setReply } from '@/app/store/slices/replySlice'
import { IMessage } from '@/app/store/slices/types/types'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/shared/ContextMenu/ContextMenu'
import { motion, PanInfo } from 'framer-motion'
import { Copy, CopyCheck, Reply } from 'lucide-react'
import { memo, useRef } from 'react'

const DRAG_CONSTRAINTS_MINE = { left: -150, right: 0 }
const DRAG_CONSTRAINTS_OTHER = { left: 0, right: 150 }

const APPEAR_ANIMATION_MINE = { x: [50, 0] }
const APPEAR_ANIMATION_OTHER = { x: [-50, 0] }

interface IMessageProps {
  message: IMessage
  isLastMessage: boolean
  onMessageReply: (id: string) => void
}

const Message = memo(function Message({
  message,
  isLastMessage,
  onMessageReply,
}: IMessageProps) {
  const reply = message.reply
  const appearAnimation = message.isMine
    ? APPEAR_ANIMATION_MINE
    : APPEAR_ANIMATION_OTHER
  const messageClassName = cn(
    `p-2 my-2 rounded-lg w-2/3 break-all transition-colors delay-300`,
    {
      'order-first': !message.isMine,
      'bg-alert': message.isAlerted,
      'bg-background-section': !message.isAlerted,
    },
  )

  const dispatch = useAppDispatch()
  const copyTimeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pointedDownMessageRef = useRef<IMessage | null>(null)

  function onCopySelect(e: Event) {
    e.preventDefault()
    const messageId = message.id

    navigator.clipboard.writeText(message.value)
    dispatch(setIsCopied({ id: messageId, state: true }))

    if (copyTimeoutIdRef.current !== null) {
      clearTimeout(copyTimeoutIdRef.current)
      copyTimeoutIdRef.current = null
    }

    copyTimeoutIdRef.current = setTimeout(
      () => dispatch(setIsCopied({ id: messageId, state: false })),
      3000,
    )
  }

  function onReplySelect() {
    dispatch(
      setReply({
        repliedMessageId: message.id,
        isRepliedMessageMine: message.isMine,
        value: message.value,
      }),
    )
  }

  function onPointerDownMessageHandler() {
    pointedDownMessageRef.current = message
  }

  function onDragEndHandler(info: PanInfo) {
    const message = pointedDownMessageRef.current

    if (message === null) return

    const shouldActivateReply = message.isMine
      ? info.offset.x < -200
      : info.offset.x > 200

    if (shouldActivateReply) {
      dispatch(
        setReply({
          repliedMessageId: message.id,
          isRepliedMessageMine: message.isMine,
          value: message.value,
        }),
      )
    }
    pointedDownMessageRef.current = null
  }

  function onContextMenuOpenChanged(isContextMenuOpen: boolean) {
    if (isContextMenuOpen) return

    if (message.isCopied) {
      dispatch(setIsCopied({ id: message.id, state: false }))
    }

    if (copyTimeoutIdRef.current !== null) {
      clearTimeout(copyTimeoutIdRef.current)
      copyTimeoutIdRef.current = null
    }
  }

  return (
    <div className="flex justify-between items-center">
      <Reply
        className={cn('stroke-muted', {
          '-scale-x-100': !message.isMine,
        })}
      />
      <ContextMenu
        onOpenChange={(isContextMenuOpen) =>
          onContextMenuOpenChanged(isContextMenuOpen)
        }
      >
        <ContextMenuTrigger asChild>
          <motion.li
            drag="x"
            dragSnapToOrigin
            dragConstraints={
              message.isMine ? DRAG_CONSTRAINTS_MINE : DRAG_CONSTRAINTS_OTHER
            }
            dragElastic={0.06}
            onDragEnd={(_, info) => onDragEndHandler(info)}
            onPointerDown={() => onPointerDownMessageHandler()}
            data-message-id={message.id}
            initial={{ x: 0 }}
            animate={isLastMessage ? appearAnimation : {}}
            className={messageClassName}
            style={{
              transitionDuration: `${MESSAGE_ALERT_DURATION}ms`,
            }}
          >
            {reply !== null && (
              <button
                onClick={() => onMessageReply(reply.repliedMessageId)}
                className="flex flex-col text-accent border-l border-accent pl-2 text-sm w-full"
              >
                <Reply className="w-4 h-4" />
                <div className="break-all text-left">
                  <span className="font-semibold">
                    {(reply.isRepliedMessageMine
                      ? MESSAGE_AUTHOR_ME
                      : MESSAGE_AUTHOR_OTHER) + ': '}
                  </span>
                  <span>{reply.value}</span>
                </div>
              </button>
            )}
            <span className="font-semibold">
              {(message.isMine ? MESSAGE_AUTHOR_ME : MESSAGE_AUTHOR_OTHER) +
                ': '}
            </span>
            {message.value}
          </motion.li>
        </ContextMenuTrigger>
        <ContextMenuContent className="text-foreground">
          <ContextMenuItem
            className="flex items-center gap-2"
            onSelect={() => onReplySelect()}
          >
            <Reply />
            <p>Reply</p>
          </ContextMenuItem>
          <ContextMenuItem
            className="flex items-center gap-2"
            onSelect={(e) => onCopySelect(e)}
          >
            {message.isCopied ? (
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
})

export default Message
