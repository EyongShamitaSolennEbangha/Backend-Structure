import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  phone: { type: String },
});

export default mongoose.model("Contact", contactSchema);
