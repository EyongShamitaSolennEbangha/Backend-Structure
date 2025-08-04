import mongoose, { connect, Schema } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum:['admin', 'client',],
    required: true,
  },
});

const  user = mongoose.model('User', userSchema,)
export default user;