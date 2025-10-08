import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  role: { type: String, enum: ["client", "provider"], default: "client" },
  createdAt: { type: Date, default: Date.now },
});

// Check if the model already exists to prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;


