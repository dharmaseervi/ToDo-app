// lib/websocket-server.ts
import { Server } from "socket.io"
import http from "http"

let io: Server

export function initSocket() {
  const httpServer = http.createServer()
  io = new Server(httpServer, {
    cors: { origin: "*" },
  })

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    if (userId) {
      socket.join(userId.toString())
      console.log(`✅ User ${userId} connected to WebSocket`)
    }

    socket.on("disconnect", () => {
      console.log(`❌ User ${userId} disconnected`)
    })
  })

  httpServer.listen(3001, () => {
    console.log("🚀 WebSocket server running on port 3001")
  })
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized")
  return io
}
