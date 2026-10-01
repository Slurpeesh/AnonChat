import { IReply } from '@/sharedTypes'

export interface IMessage {
  id: string
  value: string
  isMine: boolean
  isRead: boolean
  isReadByOther: boolean
  isHighlighted: boolean
  isCopied: boolean
  reply: IReply
  emojiId: string
}

export interface IMessageGroup {
  id: string
  isMine: boolean
  messages: IMessage[]
}
