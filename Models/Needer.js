import { connect, Schema } from "mongoose";


const neederSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  serviceNeeded: {
    type: String,
    required: true,
  },
});


const  needer= new mongoose.model('Needer', neederSchema,)
export default needer;