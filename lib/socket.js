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
    credentials: true
  },
});

// Store online users
const userSocketMap = {};

// Helper function to get all online users
const getOnlineUsers = () => {
  return Object.keys(userSocketMap);
};

// Export the getReceiverSocketId function
const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

// Export function to get all online users (for API routes)
const getOnlineUsersList = () => {
  return getOnlineUsers();
};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);
  console.log("📋 Full handshake query:", socket.handshake.query);
  console.log("📋 Headers:", socket.handshake.headers);
  
  const userId = socket.handshake.query.userId;
  console.log("📋 Connection query userId:", userId);
  console.log("📋 userId type:", typeof userId);
  
  // Check if userId is a valid MongoDB ObjectId
  const isValidObjectId = userId && mongoose.Types.ObjectId.isValid(userId);
  console.log("📋 Is userId valid ObjectId?", isValidObjectId);

  // Better validation
  if (userId && userId !== "undefined" && userId !== "null" && isValidObjectId) {
    userSocketMap[userId] = socket.id;
    console.log(`👤 User ${userId} connected with socket ${socket.id}`);
    
    // Broadcast updated online users to ALL connected clients
    const onlineUsers = getOnlineUsers();
    io.emit("getOnlineUsers", onlineUsers);
    console.log("📢 Broadcasted online users:", onlineUsers);
  } else {
    console.log("❌ Invalid userId in connection. Received:", userId);
    console.log("🔍 Will wait for user_online event...");
  }

  // Listen for user_online event with better validation
  socket.on("user_online", (userId) => {
    console.log("🟢 user_online event received:", userId);
    console.log("🟢 user_online event type:", typeof userId);
    
    const isValid = userId && mongoose.Types.ObjectId.isValid(userId);
    
    if (userId && userId !== "undefined" && userId !== "null" && isValid) {
      userSocketMap[userId] = socket.id;
      const onlineUsers = getOnlineUsers();
      io.emit("getOnlineUsers", onlineUsers);
      console.log("📢 Updated online users after user_online:", onlineUsers);
    } else {
      console.log("❌ Invalid userId in user_online event:", userId);
    }
  });

  // Listen for user_offline event
  socket.on("user_offline", (userId) => {
    console.log("🔴 user_offline event received:", userId);
    
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      const onlineUsers = getOnlineUsers();
      io.emit("getOnlineUsers", onlineUsers);
      console.log("📢 Updated online users after user_offline:", onlineUsers);
    }
  });

  // Event-specific room for notifications
  socket.on("join-events", () => {
    socket.join("events-room");
    console.log(`📅 Socket ${socket.id} joined events room`);
  });

  // Leave events room
  socket.on("leave-events", () => {
    socket.leave("events-room");
    console.log(`📅 Socket ${socket.id} left events room`);
  });

  // Handle typing events
  socket.on("typing-start", (data) => {
    const { receiverId, conversationId } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user-typing", {
        senderId: userId,
        conversationId,
        isTyping: true
      });
      console.log(`⌨️ User ${userId} started typing to ${receiverId}`);
    }
  });

  socket.on("typing-stop", (data) => {
    const { receiverId, conversationId } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user-typing", {
        senderId: userId,
        conversationId,
        isTyping: false
      });
      console.log(`⌨️ User ${userId} stopped typing to ${receiverId}`);
    }
  });

  // Handle message read receipts
  socket.on("message-read", (data) => {
    const { messageId, senderId } = data;
    const senderSocketId = getReceiverSocketId(senderId);
    
    if (senderSocketId) {
      io.to(senderSocketId).emit("message-read", {
        messageId,
        readBy: userId,
        readAt: new Date()
      });
      console.log(`📖 Message ${messageId} read by ${userId}`);
    }
  });

  // Handle new messages
  socket.on("new-message", (data) => {
    const { receiverId, message } = data;
    const receiverSocketId = getReceiverSocketId(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new-message", {
        ...message,
        senderId: userId
      });
      console.log(`💬 New message from ${userId} to ${receiverId}`);
    }
  });

  // Handle connection health check
  socket.on("ping", () => {
    socket.emit("pong", { 
      timestamp: new Date().toISOString(),
      message: "pong from server" 
    });
    console.log(`🏓 Ping from ${socket.id}, user: ${userId}`);
  });

  // Handle custom events for your application
  socket.on("custom-event", (data) => {
    console.log(`🎯 Custom event from ${userId}:`, data);
    // Handle your custom business logic here
  });

  // Error handling
  socket.on("error", (error) => {
    console.log(`❌ Socket error for user ${userId}:`, error);
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log("❌ User disconnected:", socket.id, "Reason:", reason);
    
    let foundUser = null;
    
    // Remove user from online users
    for (const [storedUserId, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[storedUserId];
        foundUser = storedUserId;
        console.log(`👤 User ${storedUserId} disconnected and removed from online users`);
        break;
      }
    }

    // If we couldn't find the user by socket ID but we have the userId from handshake
    if (!foundUser && userId && userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
      foundUser = userId;
      console.log(`👤 User ${userId} disconnected (via handshake)`);
    }

    // Broadcast updated online users to all clients
    if (foundUser) {
      const onlineUsers = getOnlineUsers();
      io.emit("getOnlineUsers", onlineUsers);
      console.log("📢 Online users after disconnect:", onlineUsers);
    }
  });

  // Connection confirmation
  socket.emit("connection-established", {
    message: "Successfully connected to server",
    userId: userId,
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  console.log(`🎉 Socket ${socket.id} setup complete for user ${userId}`);
});

// Make io available to routes
app.set('io', io);

// Export everything properly - ONLY ONCE at the end
export { io, app, server, getOnlineUsersList, getReceiverSocketId };
export default io;