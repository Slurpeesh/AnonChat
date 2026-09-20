import { IReply } from '@/sharedTypes'

export interface IStateController {
  id: string
  state: boolean
}

export interface IMessage {
  id: string
  value: string
  isMine: boolean
  isAlerted: boolean
  isCopied: boolean
  reply: IReply
}
