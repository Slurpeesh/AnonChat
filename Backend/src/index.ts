import { Server, Socket } from 'socket.io'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './types'

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
  cors: {
    origin: '*',
  },
})

let waitingId: string | null = null
let waitingSocket: Socket | null = null

function joinQueue(
  socket: Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) {
  if (waitingId === null) {
    const id = Date.now().toString()
    waitingId = id
    socket.data.room = id
    socket.join(id)
    waitingSocket = socket
    socket.emit('waitingStatus')
  } else {
    socket.data.room = waitingId
    socket.join(waitingId)
    waitingSocket?.emit('readyStatus')
    socket.emit('readyStatus')
    waitingSocket = null
    waitingId = null
  }
}

io.on('connection', (socket) => {
  joinQueue(socket)
  socket.on('disconnecting', () => {
    if (socket.data.room === waitingId) {
      waitingId = null
    }
  })

  socket.on('disconnect', () => {
    const roomId = socket.data.room
    const rooms = io.of('/').adapter.rooms
    const socketIds = rooms.get(roomId)
    socketIds?.forEach((socketId) => {
      const curSocket = io.sockets.sockets.get(socketId)
      if (curSocket !== undefined) {
        curSocket.leave(curSocket.data.room)
        joinQueue(curSocket)
      }
    })
  })
  socket.on('createMessage', (msg: string) => {
    io.to(socket.data.room).emit('message', msg, socket.id)
  })
})

io.listen(5122)
