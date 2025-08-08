import { connect, Schema } from "mongoose";
import mongoose from "mongoose";


const bookingSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: true,
  },
  serverProvider_id: {
    type: String,
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },
});


const  booking = new mongoose.model('Booking', bookingSchema,)
export default booking;