import Booking from "../Models/Booking.js";
import User from "../models/User.js";

// Create a new booking with frontend data
export const createBooking = async (req, res) => {
  try {
    const { 
      providerId,
      serviceType,
      eventDetails,
      serviceDetails
    } = req.body;

    console.log('📝 Received booking request from user:', req.user?.id);
    console.log('📦 Booking data:', req.body);

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "User not authenticated"
      });
    }

    // Validate provider exists
    const provider = await User.findOne({ _id: providerId, role: 'provider' });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found",
        error: "Invalid providerId"
      });
    }

    // Validate client exists
    const client = await User.findById(req.user.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client user not found",
        error: "Invalid clientId"
      });
    }

    // Create booking with the new schema
    const newBooking = new Booking({
      clientId: req.user.id,
      providerId: providerId,
      serviceType: serviceType,
      eventDetails: {
        eventName: eventDetails?.eventName || 'Unknown Event',
        eventType: eventDetails?.eventType || 'custom',
        eventDate: eventDetails?.eventDate || new Date(),
        eventTime: eventDetails?.eventTime || '12:00',
        location: eventDetails?.location || '',
        guestCount: eventDetails?.guestCount || 0,
        specialRequirements: eventDetails?.specialRequirements || ''
      },
      serviceDetails: {
        basePrice: serviceDetails?.basePrice || 0,
        addons: serviceDetails?.addons || [],
        travelFee: serviceDetails?.travelFee || 0,
        discount: serviceDetails?.discount || 0,
        totalAmount: serviceDetails?.totalAmount || serviceDetails?.basePrice || 0
      },
      status: {
        current: 'requested',
        history: [{
          status: 'requested',
          timestamp: new Date(),
          note: 'Booking request submitted by client'
        }]
      }
    });

    const savedBooking = await newBooking.save();

    // Populate the response
    await savedBooking.populate('providerId', 'firstName lastName email phone');
    await savedBooking.populate('clientId', 'firstName lastName email phone');

    console.log('✅ Booking created successfully:', savedBooking._id);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: savedBooking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating booking",
      error: error.message,
    });
  }
};

// Get all bookings with frontend data
export const allBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = status ? { 'status.current': status } : {};

    const bookings = await Booking.find(filter)
      .populate('providerId', 'firstName lastName email phone')
      .populate('clientId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      page: parseInt(page),
      total: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching bookings",
      error: error.message,
    });
  }
};

// Get a single booking by ID
export const oneBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('providerId', 'firstName lastName email phone')
      .populate('clientId', 'firstName lastName email phone');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }
    res.status(200).json({
      success: true,
      message: "Booking fetched successfully",
      data: booking,
    });
  } catch (error) {
    console.error("❌ Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching booking",
      error: error.message,
    });
  }
};

// Update a booking status
export const updateBooking = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    // Update status and add to history
    booking.status.current = status;
    booking.status.history.push({
      status: status,
      timestamp: new Date(),
      note: note || `Status changed to ${status}`
    });

    const updatedBooking = await booking.save();
    
    // Populate the response
    await updatedBooking.populate('providerId', 'firstName lastName email phone');
    await updatedBooking.populate('clientId', 'firstName lastName email phone');

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("❌ Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating booking",
      error: error.message,
    });
  }
};

// Delete a booking
export const deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }
    res.status(200).json({ 
      success: true,
      message: "Booking deleted successfully",
      data: deletedBooking 
    });
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting booking",
      error: error.message,
    });
  }
};

// Get bookings for a specific provider
export const providerBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const providerId = req.params.providerId;

    const filter = { providerId };
    if (status) {
      filter['status.current'] = status;
    }

    const bookings = await Booking.find(filter)
      .populate('clientId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Provider bookings fetched successfully",
      page: parseInt(page),
      total: bookings.length,
      data: bookings,
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

// Get bookings for a specific client
export const clientBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const clientId = req.params.clientId;

    const filter = { clientId };
    if (status) {
      filter['status.current'] = status;
    }

    const bookings = await Booking.find(filter)
      .populate('providerId', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Client bookings fetched successfully",
      page: parseInt(page),
      total: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching client bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching client bookings",
      error: error.message,
    });
  }
};
