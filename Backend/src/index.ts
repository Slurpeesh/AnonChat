import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@/sharedTypes'
import { randomUUID } from 'crypto'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { ReplySchema } from './schemas'

const httpServer = createServer((req, res) => {
  if (req.url === '/healthz') {
    console.log('Server is healthy')
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('OK')
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found')
  }
})

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
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
  >,
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
  socket.on('createMessage', (msg: string, reply) => {
    const parsed = ReplySchema.safeParse(reply)
    if (!parsed.success) {
      console.error('Invalid reply from client:', parsed.error.issues)
      return
    }

    io.to(socket.data.room).emit('message', randomUUID(), msg, socket.id, reply)
  })
})

httpServer.listen(5122, () => {
  console.log('Server is listening on port 5122')
})
