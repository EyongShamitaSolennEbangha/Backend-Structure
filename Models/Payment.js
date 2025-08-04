import { connect, Schema } from "mongoose";


const paymentSchema = new mongoose.Schema({
  booking_id: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentDate: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});


const  payment = new mongoose.model('Payment', paymentSchema,)
export default payment;