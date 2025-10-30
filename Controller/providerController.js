import Booking from "../Models/Booking.js";
import User from "../Models/User.js";

// Get all booking requests for the logged-in provider
export const getProviderBookings = async (req, res) => {
  try {
    const providerId = req.user.id;
    
    console.log('🔍 Fetching bookings for provider:', providerId);

    // Find all bookings where the provider is the current user
    const bookings = await Booking.find({ 
      providerId: providerId 
    })
    .populate('clientId', 'firstName lastName email phone rating')
    .populate('providerId', 'firstName lastName email phone companyName')
    .sort({ createdAt: -1 });

    console.log('✅ Found bookings for provider:', bookings.length);

    res.status(200).json({
      success: true,
      message: "Provider bookings fetched successfully",
      data: {
        requests: bookings,
        total: bookings.length
      }
    });
  } catch (error) {
    console.error("❌ Error fetching provider bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching provider bookings",
      error: error.message,
    });
  }
};

// Get specific booking details
export const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    const booking = await Booking.findOne({
      _id: id,
      providerId: providerId
    })
    .populate('clientId', 'firstName lastName email phone rating')
    .populate('providerId', 'firstName lastName email phone companyName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        error: "Booking does not exist or you don't have permission to view it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking details fetched successfully",
      data: booking
    });
  } catch (error) {
    console.error("❌ Error fetching booking details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching booking details",
      error: error.message,
    });
  }
};

// Accept a booking request
export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;

    console.log('✅ Accepting booking:', id, 'for provider:', providerId);

    const booking = await Booking.findOne({
      _id: id,
      providerId: providerId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        error: "Booking does not exist or you don't have permission to modify it"
      });
    }

    // Update booking status
    booking.status.current = 'accepted';
    booking.status.history.push({
      status: 'accepted',
      timestamp: new Date(),
      note: 'Booking accepted by provider'
    });

    const updatedBooking = await booking.save();
    
    // Populate the response
    await updatedBooking.populate('clientId', 'firstName lastName email phone');
    await updatedBooking.populate('providerId', 'firstName lastName email phone companyName');

    console.log('🎉 Booking accepted successfully:', updatedBooking._id);

    res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      data: updatedBooking
    });
  } catch (error) {
    console.error("❌ Error accepting booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while accepting booking",
      error: error.message,
    });
  }
};

// Decline a booking request
export const declineBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user.id;
    const { reason } = req.body;

    console.log('❌ Declining booking:', id, 'for provider:', providerId);

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
        error: "Please provide a reason for declining the booking"
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      providerId: providerId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        error: "Booking does not exist or you don't have permission to modify it"
      });
    }

    // Update booking status
    booking.status.current = 'rejected';
    booking.status.history.push({
      status: 'rejected',
      timestamp: new Date(),
      note: `Booking declined by provider. Reason: ${reason}`
    });

    const updatedBooking = await booking.save();
    
    // Populate the response
    await updatedBooking.populate('clientId', 'firstName lastName email phone');
    await updatedBooking.populate('providerId', 'firstName lastName email phone companyName');

    console.log('📝 Booking declined successfully:', updatedBooking._id);

    res.status(200).json({
      success: true,
      message: "Booking declined successfully",
      data: updatedBooking
    });
  } catch (error) {
    console.error("❌ Error declining booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while declining booking",
      error: error.message,
    });
  }
};