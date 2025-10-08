import Notification from "../Models/Notification.js";

export const createNotification = async (notificationData) => {
  const newNotification = new Notification({
    user_id: notificationData.user_id,
    event_id: notificationData.event_id,
    notificationType: notificationData.notificationType,
    notificationMessage: notificationData.notificationMessage,
    scheduledAt: notificationData.scheduledAt, // for reminders
  });

  return await newNotification.save();
};
