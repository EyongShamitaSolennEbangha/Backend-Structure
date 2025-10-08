import { Server } from "socket.io";
import http from "http";
import express from "express";
import mongoose from "mongoose";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Store online users
const userSocketMap = {};

// Export the getReceiverSocketId function
export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    userSocketMap[userId] = socket.id;
    console.log(`👤 User ${userId} connected with socket ${socket.id}`);
  }

  // Event-specific room
  socket.on("join-events", () => {
    socket.join("events-room");
    console.log(`📅 Socket ${socket.id} joined events room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (const [key, value] of Object.entries(userSocketMap)) {
      if (value === socket.id) {
        delete userSocketMap[key];
        console.log(`👤 User ${key} disconnected`);
        break;
      }
    }
  });
});

// Make io available to routes
app.set('io', io);

// Export everything properly
export { io, app, server };
export default io;

