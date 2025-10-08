import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  eventDate: { type: String, required: true },
  Time: { type: String, required: true },
  location: { type: String, required: true },
  Description: { type: String }, // note typo matches your schema
  contact: [
    {
      phone: { type: String },
    },
  ],
  guest: [
    {
      guestEmail: { type: String },
    },
  ],
  venue: {
    venuecapacity: { type: Number, required: true },
  },
});

export default mongoose.model("Event", eventSchema);
