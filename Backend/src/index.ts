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

const typingTimeouts = new Map<string, NodeJS.Timeout>()

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
    const existing = typingTimeouts.get(socket.id)
    if (existing) clearTimeout(existing)
    typingTimeouts.delete(socket.id)
    socket.to(socket.data.room).emit('otherTyping', false)

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
  socket.on('typing', (isTyping) => {
    const existing = typingTimeouts.get(socket.id)
    if (existing) clearTimeout(existing)

    socket.to(socket.data.room).emit('otherTyping', isTyping)

    if (isTyping) {
      const timeout = setTimeout(() => {
        socket.to(socket.data.room).emit('otherTyping', false)
        typingTimeouts.delete(socket.id)
      }, 3000)
      typingTimeouts.set(socket.id, timeout)
    } else {
      typingTimeouts.delete(socket.id)
    }
  })
  socket.on('messageRead', (messageIds) => {
    socket.to(socket.data.room).emit('otherRead', messageIds)
  })
  socket.on('applyEmoji', (messageId, emojiId) => {
    io.to(socket.data.room).emit('emojiApplied', messageId, emojiId)
  })
})

httpServer.listen(5122, () => {
  console.log('Server is listening on port 5122')
})
