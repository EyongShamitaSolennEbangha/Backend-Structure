import express from 'express';
import Booking from '../Models/Booking.js';
import { authMiddleware, authorizeRoles } from '../Controller/authMiddleware.js';

const router = express.Router();

// Get all booking requests for a provider
router.get('/booking-requests', authMiddleware, authorizeRoles('provider'), async (req, res) => {
  try {
    console.log('📋 Fetching booking requests for provider:', req.user.id);
    
    const requests = await Booking.find({ 
      providerId: req.user.id 
    })
    .populate('clientId', 'firstName lastName email phone')
    .populate('providerId', 'firstName lastName email phone companyName')
    .sort({ createdAt: -1 });

    console.log('✅ Found booking requests:', requests.length);

    res.json({
      success: true,
      data: requests,
      message: 'Booking requests fetched successfully'
    });
  } catch (error) {
    console.error('❌ Error fetching booking requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking requests',
      error: error.message
    });
  }
});

// Accept a booking request
router.post('/booking-requests/:id/accept', authMiddleware, authorizeRoles('provider'), async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('✅ Accepting booking request:', id);
    console.log('👤 Authenticated provider ID:', req.user.id);

    const booking = await Booking.findById(id)
      .populate('clientId', 'firstName lastName email phone')
      .populate('providerId', 'firstName lastName email phone companyName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    console.log('🔍 Booking details:', {
      bookingProviderId: booking.providerId?._id?.toString(),
      bookingProviderIdRaw: booking.providerId,
      authenticatedUserId: req.user.id
    });

    // Flexible ID comparison - handle both ObjectId and string formats
    const bookingProviderId = booking.providerId?._id?.toString() || booking.providerId?.toString();
    const authenticatedUserId = req.user.id.toString();

    if (bookingProviderId !== authenticatedUserId) {
      console.log('❌ Authorization failed:', {
        bookingProviderId,
        authenticatedUserId,
        types: {
          booking: typeof bookingProviderId,
          auth: typeof authenticatedUserId
        }
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this booking'
      });
    }

    // Update booking status
    booking.status.current = 'accepted';
    booking.status.history.push({
      status: 'accepted',
      timestamp: new Date(),
      note: 'Booking accepted by provider'
    });

    await booking.save();

    console.log('📧 Booking accepted - would send confirmation email to:', booking.clientId.email);

    res.json({
      success: true,
      message: 'Booking request accepted successfully',
      data: booking
    });

  } catch (error) {
    console.error('❌ Error accepting booking request:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting booking request',
      error: error.message
    });
  }
});

// Decline a booking request
router.post('/booking-requests/:id/decline', authMiddleware, authorizeRoles('provider'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log('❌ Declining booking request:', id, 'Reason:', reason);
    console.log('👤 Authenticated provider ID:', req.user.id);

    const booking = await Booking.findById(id)
      .populate('clientId', 'firstName lastName email phone')
      .populate('providerId', 'firstName lastName email phone companyName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    console.log('🔍 Booking details:', {
      bookingProviderId: booking.providerId?._id?.toString(),
      bookingProviderIdRaw: booking.providerId,
      authenticatedUserId: req.user.id
    });

    // Flexible ID comparison
    const bookingProviderId = booking.providerId?._id?.toString() || booking.providerId?.toString();
    const authenticatedUserId = req.user.id.toString();

    if (bookingProviderId !== authenticatedUserId) {
      console.log('❌ Authorization failed:', {
        bookingProviderId,
        authenticatedUserId
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to decline this booking'
      });
    }

    // Update booking status
    booking.status.current = 'rejected';
    booking.status.history.push({
      status: 'rejected',
      timestamp: new Date(),
      note: `Booking declined by provider. Reason: ${reason || 'No reason provided'}`
    });

    await booking.save();

    console.log('📧 Booking declined - would send notification email to:', booking.clientId.email);

    res.json({
      success: false,
      message: 'Booking request declined successfully',
      data: booking
    });

  } catch (error) {
    console.error('❌ Error declining booking request:', error);
    res.status(500).json({
      success: false,
      message: 'Error declining booking request',
      error: error.message
    });
  }
});

export default router;