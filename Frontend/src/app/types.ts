import { IReply } from './store/slices/types/types'

export interface ServerToClientEvents {
  waitingStatus: () => void
  readyStatus: () => void
  message: (msg: string, id: string, reply: IReply) => void
}

export interface ClientToServerEvents {
  createMessage: (msg: string, reply: IReply) => void
}

export interface InterServerEvents {}

export interface SocketData {
  room: string
}
