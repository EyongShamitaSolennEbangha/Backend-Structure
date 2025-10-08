// Models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'XAF'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['mobile_money', 'card', 'bank_transfer']
  },
  provider: {
    type: String,
    required: true,
    enum: ['mtn', 'orange', 'express', 'visa', 'mastercard', 'bank']
  },
  
  // Client information
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientPhone: String,
  
  // Service provider information
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceProviderPhone: String,
  
  // Booking reference
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  
  // Payment status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'held', 'released', 'refunded', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Escrow details
  escrowStatus: {
    type: String,
    enum: ['held', 'released', 'refunded', null],
    default: null
  },
  heldUntil: Date, // When the payment will be automatically released
  releaseDate: Date, // When payment was actually released
  refundDate: Date, // When payment was refunded
  
  // Transaction details
  description: String,
  reference: {
    type: String,
    required: true
  },
  serviceFee: {
    type: Number,
    default: 0
  },
  providerAmount: {
    type: Number // Amount that will go to service provider (amount - serviceFee)
  },
  
  // Security features
  securityCode: String, // For client to confirm service completion
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeReason: String
}, {
  timestamps: true
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;