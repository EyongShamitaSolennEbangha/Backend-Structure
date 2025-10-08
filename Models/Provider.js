// models/Provider.js
import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['photography', 'catering', 'venue', 'music', 'decoration', 'planning', 'other']
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  pricingModel: {
    type: String,
    enum: ['hourly', 'package', 'per_guest', 'fixed'],
    default: 'fixed'
  },
  addons: [{
    name: String,
    description: String,
    price: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

const availabilitySchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0-6 (Sunday-Saturday)
    required: true
  },
  slots: [{
    startTime: String, // "09:00"
    endTime: String,   // "17:00"
    isAvailable: Boolean
  }]
});

const portfolioSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  caption: String,
  category: String,
  isFeatured: {
    type: Boolean,
    default: false
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const providerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessInfo: {
    businessName: {
      type: String,
      required: true,
      trim: true
    },
    businessType: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    logo: String,
    coverImage: String,
    taxId: String,
    yearsInBusiness: Number,
    establishmentYear: Number
  },
  contactInfo: {
    primaryContact: {
      type: String,
      required: true
    },
    businessEmail: {
      type: String,
      required: true
    },
    businessPhone: {
      type: String,
      required: true
    },
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  serviceDetails: {
    services: [serviceSchema],
    areasServed: [String],
    travelFee: {
      type: Number,
      default: 0
    },
    maxTravelDistance: {
      type: Number,
      default: 50 // miles/km
    }
  },
  availability: {
    workingHours: [availabilitySchema],
    blockedDates: [Date],
    advanceNotice: {
      type: Number,
      default: 24 // hours
    }
  },
  portfolio: {
    gallery: [portfolioSchema],
    featuredWork: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }]
  },
  businessMetrics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    cancellationRate: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    responseTime: {
      type: Number, // in hours
      default: 0
    },
    revenue: {
      monthly: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    }
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    documents: [{
      type: {
        type: String,
        enum: ['license', 'insurance', 'certification', 'identity']
      },
      documentUrl: String,
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  settings: {
    autoAccept: {
      type: Boolean,
      default: false
    },
    minBookingValue: {
      type: Number,
      default: 0
    },
    maxEventsPerDay: {
      type: Number,
      default: 1
    },
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    },
    bookingBuffer: {
      type: Number, // hours between bookings
      default: 2
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
providerSchema.index({ userId: 1 });
providerSchema.index({ 'businessInfo.businessName': 'text', 'businessInfo.description': 'text' });
providerSchema.index({ 'serviceDetails.services.category': 1 });
providerSchema.index({ 'verification.isVerified': 1 });
providerSchema.index({ 'businessMetrics.averageRating': -1 });

// Update business metrics when bookings change
providerSchema.methods.updateBusinessMetrics = async function() {
  const Booking = mongoose.model('Booking');
  
  const stats = await Booking.aggregate([
    { $match: { providerId: this._id } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        completedBookings: { 
          $sum: { $cond: [{ $eq: ['$status.current', 'completed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status.current', 'cancelled'] }, 1, 0] }
        },
        totalRevenue: { $sum: '$serviceDetails.totalAmount' },
        averageRating: { $avg: '$reviews.clientToProvider.rating' },
        totalReviews: {
          $sum: { $cond: [{ $ne: ['$reviews.clientToProvider.rating', null] }, 1, 0] }
        }
      }
    }
  ]);

  if (stats.length > 0) {
    const stat = stats[0];
    this.businessMetrics.totalBookings = stat.totalBookings;
    this.businessMetrics.completedBookings = stat.completedBookings;
    this.businessMetrics.cancellationRate = stat.totalBookings > 0 ? 
      (stat.cancelledBookings / stat.totalBookings) * 100 : 0;
    this.businessMetrics.averageRating = stat.averageRating || 0;
    this.businessMetrics.totalReviews = stat.totalReviews;
    this.businessMetrics.revenue.total = stat.totalRevenue || 0;
    
    await this.save();
  }
};

// Use ES6 export
export default mongoose.model('Provider', providerSchema);