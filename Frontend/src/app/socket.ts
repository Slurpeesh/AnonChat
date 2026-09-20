import { ClientToServerEvents, ServerToClientEvents } from '@/sharedTypes'
import { io, Socket } from 'socket.io-client'

const URL =
  process.env.NODE_ENV === 'production'
    ? process.env.BACKEND_URL
    : 'http://localhost:5122'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  URL,
  {
    autoConnect: false,
  },
)
