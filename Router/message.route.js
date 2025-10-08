import express from "express";
import User from "../models/User.js";
import Message from "../Models/message.model.js"; 
import { protectRoute } from "../middleware/auth.middleware.js"; 


const messageRouter = express.Router(); 

// Apply auth middleware to all routes
messageRouter.use(protectRoute);

// Get users for sidebar (excluding current user)
messageRouter.get("/users", async (req, res) => {
  try {
    console.log('👤 Fetching users for chat - Current user:', req.user.id);
    
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('firstName lastName email role profilePic')
      .sort({ firstName: 1 });

    console.log('✅ Users found for chat:', users.length);

    res.status(200).json(users); // Return array directly for compatibility with your store
  } catch (error) {
    console.error("❌ Error fetching users for chat:", error);
    res.status(500).json({ 
      message: "Internal server error while fetching users",
      error: error.message 
    });
  }
});

// Get messages between current user and another user
messageRouter.get("/:id", async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const currentUserId = req.user.id;

    console.log('💬 Fetching messages between:', currentUserId, 'and', otherUserId);

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    })
    .populate('senderId', 'firstName lastName profilePic')
    .populate('receiverId', 'firstName lastName profilePic')
    .sort({ createdAt: 1 });

    console.log('✅ Messages found:', messages.length);

    res.status(200).json(messages); // Return array directly
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ 
      message: "Internal server error while fetching messages",
      error: error.message 
    });
  }
});

// Send a message
messageRouter.post("/send/:id", async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user.id;

    console.log('📤 Sending message from:', senderId, 'to:', receiverId);

    if (!text && !image) {
      return res.status(400).json({ 
        message: "Message text or image is required" 
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('senderId', 'firstName lastName profilePic');
    await savedMessage.populate('receiverId', 'firstName lastName profilePic');

    console.log('✅ Message sent successfully:', savedMessage._id);

    // Emit socket event if needed
    // const socket = req.app.get('socketio');
    // socket.emit('newMessage', savedMessage);

    res.status(201).json(savedMessage); // Return message object directly
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ 
      message: "Internal server error while sending message",
      error: error.message 
    });
  }
});

export default messageRouter;