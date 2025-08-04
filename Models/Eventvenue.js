import { connect, Schema } from "mongoose";


const eventVenueSchema = new mongoose.Schema({
  venueName: {
    type: String,
    required: true,
  },
  venue_address: {
    type: String,
    required: true,
  },
  venue_capacity: {
    type: Number,
    required: true,
  },
});


const  eventvenue = new mongoose.model('Eventvenue', eventVenueSchema,)
export default eventvenue;