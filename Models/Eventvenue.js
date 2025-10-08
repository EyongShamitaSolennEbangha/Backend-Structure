import mongoose from "mongoose";

const eventVenueSchema = new mongoose.Schema({
  venuecapacity: { type: Number, required: true },
});

const eventvenue = mongoose.model("Eventvenue", eventVenueSchema);
export default eventvenue;
