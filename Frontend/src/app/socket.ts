import { ClientToServerEvents, ServerToClientEvents } from '@/sharedTypes'
import { io, Socket } from 'socket.io-client'

const URL = import.meta.env.PROD
  ? import.meta.env.VITE_BACKEND_URL
  : 'http://localhost:5122'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  URL,
  {
    autoConnect: false,
  },
)
