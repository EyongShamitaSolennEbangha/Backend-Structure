import express from "express";
import { getOnlineUsersList, getReceiverSocketId } from "../lib/socket.js"; // Adjust path as needed

const router = express.Router();

// Test route to check all online users
router.get("/online-users", (req, res) => {
  try {
    const onlineUsers = getOnlineUsersList();
    
    res.json({
      success: true,
      onlineUsers: onlineUsers,
      count: onlineUsers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in online-users test route:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test route to check if a specific user is online
router.get("/online-status/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const onlineUsers = getOnlineUsersList();
    const isOnline = onlineUsers.includes(userId);
    const socketId = getReceiverSocketId(userId);
    
    res.json({
      success: true,
      userId: userId,
      isOnline: isOnline,
      socketId: socketId,
      onlineUsersCount: onlineUsers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in online-status test route:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;