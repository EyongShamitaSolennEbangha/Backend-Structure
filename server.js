import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import eventRoutes from "./Router/eventManagent.js";
import messageRouter from "./Router/message.route.js";
import axios from "axios";
import bookingRouter from "./Router/bookingManagement.js";
import Router from "./Router/auth.js";
import paymentRouter from "./Router/paymentManagement.js";
import providerBookingRoutes from './Router/provider.js';
import ServiceRouter from "./Router/service.js"
import Notification from "./Models/Notification.js";
import { app, server } from "./lib/socket.js";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { startNotificationScheduler } from "./scheduler/notificationSchedular.js";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";







dotenv.config();
import morgan from "morgan";

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// CORS
app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());

// Middleware
app.use(express.json());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // App Password
  },
});

// Helper to emit notification updates
const emitNotificationUpdate = async () => {
  try {
    const inboxCount = await Notification.countDocuments({
      status: "unread",
      direction: "incoming", // Changed from isSent to direction
    });
    const io = app.get("io");
    if (io) {
      io.emit("updateInboxCount", inboxCount);
    }
  } catch (error) {
    console.error("Error emitting notification update:", error);
  }
};

connectDB()
  .then(() => {
    startNotificationScheduler();

    // Routes
    app.use("/api/auth", Router);
    app.use("/api/messages", messageRouter);
    app.use("/api", eventRoutes);
    app.use("/api/bookings", bookingRouter);
    app.use("/api/services", ServiceRouter)
    app.use("/", paymentRouter);
    app.use("/api/providers", providerBookingRoutes)
    


    // NOTIFICATION ROUTES - CORRECTED LOGIC

    // Get inbox notifications (notifications received FROM outside)
    app.get("/api/notifications/inbox", async (req, res) => {
      try {
        const notifications = await Notification.find({
          direction: "incoming", // These are incoming to the client
        }).sort({
          timestamp: -1,
        });
        res.json(notifications);
      } catch (err) {
        console.error("Error fetching inbox notifications:", err);
        res.status(500).json({ error: err.message });
      }
    });

    // Get sent notifications (notifications sent BY the client to external people)
    app.get("/api/notifications/sent", async (req, res) => {
      try {
        const notifications = await Notification.find({
          direction: "outgoing", // These were sent out by the client
        }).sort({
          timestamp: -1,
        });
        res.json(notifications);
      } catch (err) {
        console.error("Error fetching sent notifications:", err);
        res.status(500).json({ error: err.message });
      }
    });

    // Send notification (Client sends to external people)
    app.post("/api/send-notification", async (req, res) => {
      try {
        const { type, title, message, recipients, timestamp, priority } =
          req.body;

        console.log(
          "📤 Client sending notification to external recipients:",
          recipients
        );

        // Validate required fields
        if (
          !type ||
          !title ||
          !message ||
          !recipients ||
          recipients.length === 0
        ) {
          return res.status(400).json({
            success: false,
            error:
              "Missing required fields: type, title, message, and at least one recipient are required",
          });
        }

        // Create OUTGOING notification (client → external people)
        const sentNotification = new Notification({
          type,
          title,
          message,
          recipients: ["client"], // The client is tracking this sent message
          externalRecipients: recipients, // The actual external people who received it
          timestamp: timestamp || new Date(),
          status: "sent",
          sender: "client", // The client sent this
          priority: priority || "medium",
          direction: "outgoing", // This was sent OUT by the client
        });

        await sentNotification.save();
        console.log("✅ Outgoing notification saved:", sentNotification._id);

        // TODO: Actually send the email/SMS to external recipients here
        console.log(`📧 Would send ${type} to: ${recipients.join(", ")}`);
        console.log(`📧 Subject: ${title}`);
        console.log(`📧 Message: ${message}`);

        // Simulate sending to external services
        if (type === "email") {
          // TODO: Integrate with Nodemailer
          console.log("📧 Email would be sent via Nodemailer");
        } else if (type === "sms") {
          // TODO: Integrate with Twilio
          console.log("📱 SMS would be sent via Twilio");
        }

        // Simulate receiving a reply after a delay (for demo purposes)
        setTimeout(async () => {
          try {
            const randomRecipient =
              recipients[Math.floor(Math.random() * recipients.length)];

            // Create INCOMING notification (external person → client)
            const replyNotification = new Notification({
              type: type,
              title: `Re: ${title}`,
              message: `Thank you for your message. This is a reply from ${randomRecipient} regarding: "${message}"`,
              recipients: ["client"], // The client receives this reply
              timestamp: new Date(),
              status: "unread",
              sender: randomRecipient, // The external person who replied
              priority: priority || "medium",
              direction: "incoming", // This is INCOMING to the client
              relatedNotificationId: sentNotification._id, // Link to the original sent message
            });

            await replyNotification.save();

            // Emit socket event for the incoming reply
            const io = app.get("io");
            if (io) {
              io.emit("newNotification", replyNotification);
              await emitNotificationUpdate();
            }

            console.log(`📨 Simulated reply received from ${randomRecipient}`);
          } catch (error) {
            console.error("Error creating simulated reply:", error);
          }
        }, 8000); // 8 second delay for demo

        res.json({
          success: true,
          message: "Notification sent successfully to external recipients",
          id: sentNotification._id,
          recipients: recipients,
        });
      } catch (err) {
        console.error("❌ Error sending notification:", err);
        res.status(500).json({
          success: false,
          error: err.message,
        });
      }
    });

    // API to simulate receiving a notification from outside (for testing)
    // app.post("/api/simulate-incoming", async (req, res) => {
    //   try {
    //     const { from, subject, message, type = "email", priority = "medium" } = req.body;

    //     if (!from || !message) {
    //       return res.status(400).json({
    //         success: false,
    //         error: "Missing required fields: from and message are required"
    //       });
    //     }

    //     // Create INCOMING notification (external → client)
    //     const incomingNotification = new Notification({
    //       type,
    //       title: subject || `Message from ${from}`,
    //       message,
    //       recipients: ["client"], // Always sent to the client
    //       timestamp: new Date(),
    //       status: "unread",
    //       sender: from, // The external sender
    //       priority,
    //       direction: "incoming", // This is incoming to the client
    //     });

    //     await incomingNotification.save();

    //     // Emit socket event
    //     const io = app.get('io');
    //     if (io) {
    //       io.emit("newNotification", incomingNotification);
    //       await emitNotificationUpdate();
    //     }

    //     res.json({
    //       success: true,
    //       message: "Incoming notification simulated successfully",
    //       id: incomingNotification._id
    //     });

    //   } catch (err) {
    //     console.error("❌ Error simulating incoming notification:", err);
    //     res.status(500).json({
    //       success: false,
    //       error: err.message
    //     });
    //   }
    // });

    // Mark notification as read
    app.post("/api/mark-notification", async (req, res) => {
      try {
        const { id } = req.body;

        console.log("📝 Marking notification as read:", id);

        const updatedNotification = await Notification.findByIdAndUpdate(
          id,
          { status: "read" },
          { new: true }
        );

        if (!updatedNotification) {
          return res.status(404).json({
            success: false,
            error: "Notification not found",
          });
        }

        // Emit socket event for real-time update
        const io = app.get("io");
        if (io) {
          io.emit("notification-updated", updatedNotification);
          await emitNotificationUpdate();
        }

        res.json({
          success: true,
          message: "Notification marked as read",
        });
      } catch (err) {
        console.error("❌ Error marking notification as read:", err);
        res.status(500).json({
          success: false,
          error: err.message,
        });
      }
    });

    // Delete notification
    app.delete("/api/notifications/:id", async (req, res) => {
      try {
        const { id } = req.params;

        console.log("🗑️ Deleting notification:", id);

        const deletedNotification = await Notification.findByIdAndDelete(id);

        if (!deletedNotification) {
          return res.status(404).json({
            success: false,
            error: "Notification not found",
          });
        }

        // Emit socket event for real-time update if it was an incoming notification
        const io = app.get("io");
        if (io && deletedNotification.direction === "incoming") {
          await emitNotificationUpdate();
        }

        res.json({
          success: true,
          message: "Notification deleted successfully",
        });
      } catch (err) {
        console.error("❌ Error deleting notification:", err);
        res.status(500).json({
          success: false,
          error: err.message,
        });
      }
    });

    // Twilio configuration
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Payment route
    app.use("/api/payment", paymentRouter);
    app.use("/api/booking", bookingRouter);

    // Use server from socket.js instead of app.listen
    server.listen(3000, () => {
      console.log("🚀 Server running on port 3000 with Socket.io");
      console.log("📧 Notification system ready:");
      console.log("   - Inbox: Notifications FROM external people");
      console.log("   - Sent: Notifications TO external people");
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect DB, server not started", err);
  });
