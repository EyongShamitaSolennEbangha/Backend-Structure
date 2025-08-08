import { connect, Schema } from "mongoose";
import mongoose from "mongoose";

const serviceProviderAvailabilitySchema = new mongoose.Schema({
  service_provider_id: {
    type: String,
    required: true,
  },
  availabilityDate: {
    type: Date,
    required: true,
  },
});



const  serviceProviderAvailability = new mongoose.model('ServiceProAvaliabilty', serviceProviderAvailabilitySchema,)
export default serviceProviderAvailability;