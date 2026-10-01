import { useAppDispatch } from '@/app/hooks/useActions'
import {
  cn,
  INVALID_EMOJI_ID,
  MESSAGE_AUTHOR_DIVIDER,
  MESSAGE_AUTHOR_ME,
  MESSAGE_AUTHOR_OTHER,
  MESSAGE_HIGHLIGHT_DURATION,
  MESSAGE_UNREAD_DURATION,
} from '@/app/lib/utils'
import { socket } from '@/app/socket'
import { setIsCopied } from '@/app/store/slices/messageGroupsSlice'
import { setReply } from '@/app/store/slices/replySlice'
import { Message, MessageContent, MessageHeader } from '@/entities/Message'
import { Bubble, BubbleContent, BubbleReactions } from '@/features/Bubble'
import { EMOJI_MAP } from '@/features/Emoji/emojiMap'
import EmojiPicker from '@/features/Emoji/EmojiPicker'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/shared/ContextMenu'
import { IMessage } from '@/types'
import { Check, CheckCheck, Copy, CopyCheck, Reply } from 'lucide-react'
import { PanInfo } from 'motion/react'
import { memo, useCallback, useRef } from 'react'

const DRAG_CONSTRAINTS_MINE = { left: -150, right: 0 }
const DRAG_CONSTRAINTS_OTHER = { left: 0, right: 150 }

const APPEAR_ANIMATION_MINE = { x: [50, 0] }
const APPEAR_ANIMATION_OTHER = { x: [-50, 0] }

const REPLY_CLICK_THRESHOLD_PX = 10
const MESSAGE_DRAG_THRESHOLD_PX = 140
const REPLY_LONG_PRESS_THRESHOLD_MS = 500

interface IChatMessageProps {
  message: IMessage
  isLastMessage: boolean
  isFirstInGroup: boolean
  onMessageReply: (id: string) => void
}

const ChatMessage = memo(function ChatMessage({
  message,
  isLastMessage,
  isFirstInGroup,
  onMessageReply,
}: IChatMessageProps) {
  const reply = message.reply
  const appearAnimation = message.isMine
    ? APPEAR_ANIMATION_MINE
    : APPEAR_ANIMATION_OTHER
  const bubbleVariant =
    message.isHighlighted || !message.isRead ? 'alert' : 'secondary'
  const AppliedEmoji = EMOJI_MAP[message.emojiId]

  const dispatch = useAppDispatch()
  const copyTimeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const replyPointerStartRef = useRef<{
    x: number
    y: number
    time: number
  } | null>(null)
  const messageRef = useRef(message)
  messageRef.current = message

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

  function onReplyPointerDown(e: React.PointerEvent) {
    replyPointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    }
  }

  function onReplyPointerCancel() {
    replyPointerStartRef.current = null
  }

  function onReplyPointerUp(e: React.PointerEvent, id: string) {
    if (e.button !== 0) return

    const start = replyPointerStartRef.current
    replyPointerStartRef.current = null
    if (!start) return

    const dx = Math.abs(e.clientX - start.x)
    const dy = Math.abs(e.clientY - start.y)
    if (dx > REPLY_CLICK_THRESHOLD_PX || dy > REPLY_CLICK_THRESHOLD_PX) return

    const duration = Date.now() - start.time
    if (duration > REPLY_LONG_PRESS_THRESHOLD_MS) return

    onMessageReply(id)
  }

  function onDragEndHandler(info: PanInfo) {
    const shouldActivateReply = message.isMine
      ? info.offset.x < -MESSAGE_DRAG_THRESHOLD_PX
      : info.offset.x > MESSAGE_DRAG_THRESHOLD_PX

    if (shouldActivateReply) {
      dispatch(
        setReply({
          repliedMessageId: message.id,
          isRepliedMessageMine: message.isMine,
          value: message.value,
        }),
      )
    }
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

  const onEmojiClicked = useCallback((emojiId: string) => {
    const message = messageRef.current
    socket.emit(
      'applyEmoji',
      message.id,
      message.emojiId === emojiId ? INVALID_EMOJI_ID : emojiId,
    )
  }, [])

  return (
    <Message
      align={message.isMine ? 'end' : 'start'}
      className="justify-between items-center"
    >
      <ContextMenu
        onOpenChange={(isContextMenuOpen) =>
          onContextMenuOpenChanged(isContextMenuOpen)
        }
      >
        <MessageContent>
          {isFirstInGroup && (
            <MessageHeader className="text-base">
              {message.isMine ? MESSAGE_AUTHOR_ME : MESSAGE_AUTHOR_OTHER}
            </MessageHeader>
          )}
          <ContextMenuTrigger asChild>
            <Bubble
              id={`message-${message.id}`}
              variant={bubbleVariant}
              drag="x"
              dragSnapToOrigin
              dragConstraints={
                message.isMine ? DRAG_CONSTRAINTS_MINE : DRAG_CONSTRAINTS_OTHER
              }
              dragElastic={0.06}
              onDragEnd={(_, info) => onDragEndHandler(info)}
              initial={{ x: 0 }}
              animate={isLastMessage ? appearAnimation : {}}
            >
              <BubbleContent
                className="flex flex-col gap-1 min-w-20 transition-colors delay-300 whitespace-pre-wrap"
                style={{
                  transitionDuration: `${
                    message.isHighlighted
                      ? MESSAGE_HIGHLIGHT_DURATION
                      : MESSAGE_UNREAD_DURATION
                  }ms`,
                }}
              >
                {reply !== null && (
                  <button
                    onPointerDown={onReplyPointerDown}
                    onPointerUp={(e) =>
                      onReplyPointerUp(e, reply.repliedMessageId)
                    }
                    onPointerCancel={onReplyPointerCancel}
                    className="flex flex-col text-accent border-l border-accent pl-2 text-sm w-full"
                  >
                    <Reply className="size-4" />
                    <div className="break-all text-left">
                      <span className="font-semibold">
                        {(reply.isRepliedMessageMine
                          ? MESSAGE_AUTHOR_ME
                          : MESSAGE_AUTHOR_OTHER) + MESSAGE_AUTHOR_DIVIDER}
                      </span>
                      <span>{reply.value}</span>
                    </div>
                  </button>
                )}
                <span>{message.value}</span>
              </BubbleContent>
              {(!message.isMine || AppliedEmoji !== undefined) && (
                <BubbleReactions align="start">
                  <EmojiPicker
                    selectedEmojiId={message.emojiId}
                    onSelect={onEmojiClicked}
                    disabled={message.isMine}
                  />
                </BubbleReactions>
              )}
              <div className="absolute -bottom-2 -right-2">
                {message.isMine ? (
                  message.isReadByOther ? (
                    <CheckCheck className="size-4 stroke-muted" />
                  ) : (
                    <Check className="size-4 stroke-muted" />
                  )
                ) : (
                  <></>
                )}
              </div>
            </Bubble>
          </ContextMenuTrigger>
        </MessageContent>
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
      <Reply
        className={cn('stroke-muted', {
          '-scale-x-100': !message.isMine,
        })}
      />
    </Message>
  )
})

export default ChatMessage
