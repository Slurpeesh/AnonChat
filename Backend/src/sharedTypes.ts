import { ReplySchema } from '@/schemas'
import z from 'zod'

// synchronize with client types

export type IReply = z.infer<typeof ReplySchema>

export interface ServerToClientEvents {
  waitingStatus: () => void
  readyStatus: () => void
  message: (
    messageId: string,
    msg: string,
    socketId: string,
    reply: IReply,
  ) => void
  otherTyping: (isTyping: boolean) => void
  otherRead: (messageIds: string[]) => void
}

export interface ClientToServerEvents {
  createMessage: (msg: string, reply: IReply) => void
  typing: (isTyping: boolean) => void
  messageRead: (messageIds: string[]) => void
}

export interface InterServerEvents {}

export interface SocketData {
  room: string
}
