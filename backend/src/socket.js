let ioInstance = null

export function handleSocket(io) {
  ioInstance = io

  io.on('connection', (socket) => {
    console.log('user connected:', socket.id)

    // Client tells us which post they are viewing
    socket.on('bid.join', ({ postId }) => {
      if (!postId) return
      const room = `post:${postId}`
      console.log(`socket ${socket.id} joining room ${room}`)
      socket.join(room)
    })

    // Optional: allow them to leave explicitly
    socket.on('bid.leave', ({ postId }) => {
      if (!postId) return
      const room = `post:${postId}`
      console.log(`socket ${socket.id} leaving room ${room}`)
      socket.leave(room)
    })

    socket.on('disconnect', () => {
      console.log('user disconnected:', socket.id)
    })
  })
}

export function emitBidUpdate(postId, payload) {
  if (!ioInstance) return
  const room = `post:${postId}`

  ioInstance.to(room).emit('bid.updated', {
    postId,
    ...payload,
  })
}
