import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["email", "sms", "system"], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  recipients: [{ type: String }], // Who should see this notification in the app
  externalRecipients: [{ type: String }], // For outgoing: who it was actually sent to
  timestamp: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["unread", "read", "sent"], 
    default: "unread" 
  },
  sender: { type: String, required: true }, // Who sent this
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  direction: { 
    type: String, 
    enum: ["incoming", "outgoing"], 
    required: true 
  }, // incoming = from external, outgoing = to external
  relatedNotificationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Notification" 
  }, // For replies: link to related message
}, {
  timestamps: true
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;