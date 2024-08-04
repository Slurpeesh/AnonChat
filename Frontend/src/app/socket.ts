import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from './types'

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === 'production'
    ? process.env.BACKEND_URL
    : 'http://localhost:5122'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  URL,
  {
    autoConnect: false,
  }
)
