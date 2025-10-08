// Example using nodemailer (email) or any SMS provider API (like Twilio)

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // Configure with your SMTP or service provider details
  host: "smtp.example.com",
  port: 587,
  auth: {
    user: "you@example.com",
    pass: "password",
  },
});

export async function sendNotification(notification) {
  try {
    // Example: send email
    const mailOptions = {
      from: "no-reply@yourdomain.com",
      to: notification.user_email, // you need to fetch user email by user_id
      subject: `Reminder: ${notification.notificationType}`,
      text: notification.notificationMessage,
    };

    await transporter.sendMail(mailOptions);

    // Update notification status
    notification.status = "sent";
    notification.sentAt = new Date();
    await notification.save();

    console.log("Notification sent to user:", notification.user_id);
  } catch (error) {
    console.error("Failed to send notification:", error);
    notification.status = "failed";
    await notification.save();
  }
}
// Add this to notificationSchedular.js
export function startNotificationScheduler() {
  // Example: setInterval or cron job to send notifications
  console.log("Notification scheduler started!");
}

// const transporter = nodemailer.createTransport({
//   host: 'smtp.example.com',
//   port: 587,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });
