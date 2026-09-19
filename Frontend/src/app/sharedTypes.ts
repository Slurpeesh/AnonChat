interface IReplyData {
  repliedMessageId: string
  value: string
  isRepliedMessageMine: boolean
}

export type IReply = IReplyData | null

export interface ServerToClientEvents {
  waitingStatus: () => void
  readyStatus: () => void
  message: (
    messageId: string,
    msg: string,
    socketId: string,
    reply: IReply,
  ) => void
}

export interface ClientToServerEvents {
  createMessage: (msg: string, reply: IReply) => void
}

export interface InterServerEvents {}

export interface SocketData {
  room: string
}
