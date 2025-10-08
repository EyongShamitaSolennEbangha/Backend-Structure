import { connect, Schema } from "mongoose";
import mongoose from "mongoose";

const guestlistSchema = new mongoose.Schema({
  // event_id:{
  //  type:String,
  //  required:true
  // },

  guestEmail: {
    type: String,
  },
});

const guestlist = new mongoose.model("Guestlist", guestlistSchema);
export default guestlist;
