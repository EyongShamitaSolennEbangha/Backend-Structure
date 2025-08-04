import { connect, Schema } from "mongoose";



const notificationSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  notificationType: {
    type: String,
    required: true,
  },
  notificationMessage: {
    type: String,
    required: true,
  },
});



const  notification = new mongoose.model('Notification', notificationSchema,)
export default notification;