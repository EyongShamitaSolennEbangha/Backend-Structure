import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  // Basic booking info
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  
  // Event details
  eventDetails: {
    eventName: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      default: 'custom'
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: String,
    location: {
      type: String,
      required: true,
    },
    guestCount: {
      type: Number,
      default: 0
    },
    specialRequirements: {
      type: String,
      default: ''
    }
  },
  
  // Service details
  serviceDetails: {
    basePrice: {
      type: Number,
      required: true,
      default: 0
    },
    addons: [{
      name: String,
      price: Number
    }],
    travelFee: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    }
  },
  
  // Status with history tracking
  status: {
    current: {
      type: String,
      enum: ['requested', 'pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'requested'
    },
    history: [{
      status: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: String
    }]
  }
}, {
  timestamps: true
});

export default mongoose.model("Booking", bookingSchema);