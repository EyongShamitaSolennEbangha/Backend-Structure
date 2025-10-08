import express from "express";
import Notification from "../Models/Notification";


const router = express.Router();


// In your server.js, replace the notification routes with these:

// Get all notifications (for inbox)
app.get("/api/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({ isSent: false })
      .sort({ timestamp: -1 });
    res.json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get inbox notifications
app.get("/api/notifications/inbox", async (req, res) => {
  try {
    const notifications = await Notification.find({ isSent: false })
      .sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching inbox notifications:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get sent notifications
app.get("/api/notifications/sent", async (req, res) => {
  try {
    const notifications = await Notification.find({ isSent: true })
      .sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching sent notifications:", err);
    res.status(500).json({ error: err.message });
  }
});

// Send notification
app.post("/api/send-notification", async (req, res) => {
  try {
    const { type, title, message, recipients, timestamp, priority } = req.body;

    console.log("📨 Received notification request:", req.body);

    // Validate required fields
    if (!type || !title || !message || !recipients || recipients.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields" 
      });
    }

    // Create main notification (sent)
    const sentNotification = new Notification({
      type,
      title,
      message,
      recipients,
      timestamp: timestamp || new Date(),
      status: "sent",
      sender: "system",
      priority: priority || "medium",
      isSent: true,
    });

    await sentNotification.save();

    // Create individual notifications for each recipient (inbox)
    const inboxPromises = recipients.map(recipient => {
      const inboxNotification = new Notification({
        type,
        title,
        message,
        recipients: [recipient],
        timestamp: timestamp || new Date(),
        status: "unread",
        sender: "system",
        priority: priority || "medium",
        isSent: false,
      });
      return inboxNotification.save();
    });

    await Promise.all(inboxPromises);

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      // Emit to all clients that a new notification was sent
      io.emit("newNotification", {
        id: sentNotification._id,
        type,
        title,
        message,
        recipients,
        timestamp: sentNotification.timestamp,
        status: "unread",
        sender: "system",
        priority,
        isSent: false
      });

      // Update inbox count
      const inboxCount = await Notification.countDocuments({ 
        status: "unread", 
        isSent: false 
      });
      io.emit("updateInboxCount", inboxCount);
    }

    res.json({ 
      success: true,
      id: sentNotification._id 
    });
  } catch (err) {
    console.error("Error sending notification:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Mark notification as read
app.post("/api/mark-notification", async (req, res) => {
  try {
    const { id } = req.body;
    
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { status: "read" },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ success: false, error: "Notification not found" });
    }

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      const inboxCount = await Notification.countDocuments({ 
        status: "unread", 
        isSent: false 
      });
      io.emit("updateInboxCount", inboxCount);
      io.emit("notification-updated", updatedNotification);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete notification
app.delete("/api/notifications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      const inboxCount = await Notification.countDocuments({ 
        status: "unread", 
        isSent: false 
      });
      io.emit("updateInboxCount", inboxCount);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;