import { connect, Schema } from "mongoose";
import mongoose from "mongoose";


const eventTaskSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: true,
  },
  taskName: {
    type: String,
    required: true,
  },
  taskDescription: {
    type: String,
    required: true,
  },
  taskStatus: {
    type: String,
    required: true,
  },
});


const  eventtask = new mongoose.model('EventTask', eventTaskSchema)
export default eventtask;