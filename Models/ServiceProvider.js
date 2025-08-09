import { connect, Schema } from "mongoose";
import mongoose from "mongoose";


const servicerSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  profile_pic: {
    type: String,
    required: true,
  },

  rating: {
    type: String,
    required: true,
  },
  id_card: {
    type: String,
    required: true,
  },

  qualifications: {
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true
  }



});


const  servicer = new mongoose.model('ServiceProvider', servicerSchema,)
export default servicer;