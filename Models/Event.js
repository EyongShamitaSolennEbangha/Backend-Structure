import { connect, Schema } from "mongoose";
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  eventTime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  guest: {
    type: Array,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },
});


const  event = new mongoose.model('Event', eventSchema,)
export default event;