import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  // Transaction identifiers
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  nkwaTransactionId: String,
  
  // Payment details
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
    enum: ['mobile_money', 'card', 'bank_transfer'],
    default: 'mobile_money'
  },
  provider: {
    type: String,
    required: true,
    enum: ['mtn', 'orange', 'express', 'visa', 'mastercard', 'bank'],
    default: 'mtn'
  },
  
  // Parties involved
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  clientPhone: String,
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  serviceProviderPhone: {
    type: String,
    required: true
  },
  
  // References
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  // Payment status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Nkwa Pay specific fields
  nkwaStatus: {
    type: String,
    enum: ['PENDING', 'SUCCESSFUL', 'FAILED', null],
    default: null
  },
  nkwaResponse: mongoose.Schema.Types.Mixed,
  
  // Financial details
  description: String,
  reference: {
    type: String,
    required: true
  },
  serviceFee: {
    type: Number,
    default: 0
  },
  providerAmount: Number,
  
  // Disbursement details
  disbursementType: {
    type: String,
    enum: ['salary', 'payout', 'refund', 'loan', 'prize', 'other'],
    default: 'payout'
  },
  isDisbursement: {
    type: Boolean,
    default: false
  },
  
  // Security and tracking
  securityCode: String,
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeReason: String,
  
  // Timestamps
  processedAt: Date,
  completedAt: Date,
  failedAt: Date
}, {
  timestamps: true
});

// Check if model already exists before creating it
const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;