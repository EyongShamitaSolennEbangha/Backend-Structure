import { connect, Schema } from "mongoose";

const guestlistSchema = new mongoose.Schema({
   event_id:{
    type:String,
    required:true
   },

   guestName:{
    type:String,
    required:true,
   },

   guestEmail:{
    type:String,
    required:true,
   }
});


const  guestlist = new mongoose.model('Guestlist', guestlistSchema,)
export default guestlist;

