export interface ServerToClientEvents {
  waitingStatus: () => void
  readyStatus: () => void
  message: (msg: string, id: string) => void
}

export interface ClientToServerEvents {
  createMessage: (msg: string) => void
}

export interface InterServerEvents {}

export interface SocketData {
  room: string
}
