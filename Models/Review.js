import { connect, Schema } from "mongoose";


const reviewsSchema = new mongoose.Schema({
  booking_id: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
});


const  review = new mongoose.model('Review', reviewsSchema,)
export default review;