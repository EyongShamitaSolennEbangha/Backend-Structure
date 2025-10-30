import { getReceiverSocketId } from "../lib/socket.js"; // Adjust path as needed
// In your message controller - sendMessage function
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    console.log('💬 === BACKEND: SENDING MESSAGE ===');
    console.log('📤 From:', senderId);
    console.log('📥 To:', receiverId);
    console.log('💬 Text:', text?.substring(0, 100));
    console.log('🖼️ Has image:', !!image);

    let imageUrl;
    if (image) {
      console.log('☁️ Uploading image to Cloudinary...');
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
      console.log('✅ Image uploaded:', imageUrl);
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    console.log('💾 Saving message to database...');
    await newMessage.save();
    console.log('✅ Message saved to DB:', newMessage._id);

    // Populate sender info
    await newMessage.populate('senderId', 'firstName lastName profilePic');
    await newMessage.populate('receiverId', 'firstName lastName profilePic');

    // Get socket instance and emit to both users
    const io = req.app.get('io');
    const senderSocketId = getReceiverSocketId(senderId);
    const receiverSocketId = getReceiverSocketId(receiverId);

    console.log('📡 Socket emission details:');
    console.log('   Sender socket:', senderSocketId);
    console.log('   Receiver socket:', receiverSocketId);

    // Emit to receiver if online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log('📤 Message emitted to RECEIVER:', receiverId);
    } else {
      console.log('⚠️ Receiver not online:', receiverId);
    }

    // Also emit to sender (for real-time update in their own UI)
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
      console.log('📤 Message emitted to SENDER:', senderId);
    }

    console.log('✅ Message process completed successfully');
    res.status(201).json(newMessage);
    
  } catch (error) {
    console.log("❌ BACKEND ERROR in sendMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};