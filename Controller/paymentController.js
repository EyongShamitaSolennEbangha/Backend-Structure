import Payment from "../Models/Payment.js";
import Booking from "../Models/Booking.js";
import nkwaPayService from "../services/nkwaPayService.js";

// Generate unique transaction ID
function generateTransactionId() {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new payment and initiate disbursement
export async function createPayment(req, res) {
  try {
    const paymentData = req.body;

    console.log('📦 Received payment request:', paymentData);

    // Validate required fields - make them optional for testing
    if (!paymentData.serviceProviderPhone || !paymentData.amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: serviceProviderPhone and amount are required"
      });
    }

    // Calculate commission and provider amount
    const commissionRate = 0.03; // 3%
    const commissionAmount = paymentData.amount * commissionRate;
    const providerAmount = paymentData.amount - commissionAmount;

    // Generate transaction references
    const transactionId = generateTransactionId();
    const reference = `PAY_${Date.now()}`;

    // Create payment record with optional fields
    const newPayment = new Payment({
      transactionId,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod || 'mobile_money',
      provider: paymentData.serviceProviderPhone.startsWith('6') ? 'mtn' : 'orange',
      clientId: paymentData.clientId || null,
      clientPhone: paymentData.clientPhone || '+237600000000',
      serviceProviderId: paymentData.serviceProviderId || null,
      serviceProviderPhone: paymentData.serviceProviderPhone,
      bookingId: paymentData.bookingId || null,
      description: paymentData.description || `Payment to ${paymentData.serviceProviderPhone}`,
      reference,
      serviceFee: commissionAmount,
      providerAmount,
      isDisbursement: true,
      disbursementType: paymentData.disbursementType || 'payout',
      status: 'pending'
    });

    // Save payment record first
    const savedPayment = await newPayment.save();
    console.log('💾 Payment saved to database:', savedPayment.transactionId);

    // DEVELOPMENT MODE: Simulate success if no real API key
    if (process.env.NODE_ENV === 'development' && 
        (!process.env.NKWA_PAY_API_KEY || process.env.NKWA_PAY_API_KEY.includes('test'))) {
      
      console.log('🔧 Development mode: Simulating Nkwa Pay response');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment with simulated success
      savedPayment.nkwaTransactionId = `NKWA_DEV_${Date.now()}`;
      savedPayment.nkwaStatus = 'SUCCESSFUL';
      savedPayment.status = 'successful';
      savedPayment.nkwaResponse = {
        simulated: true,
        message: 'Development mode - no real API call made'
      };
      savedPayment.completedAt = new Date();
      
      await savedPayment.save();

      return res.status(201).json({
        success: true,
        message: "💰 Payment created successfully (Development Mode)",
        data: {
          payment: savedPayment,
          disbursement: {
            id: savedPayment.nkwaTransactionId,
            status: 'SUCCESSFUL',
            simulated: true
          }
        }
      });
    }

    // PRODUCTION MODE: Real Nkwa Pay API call
    console.log('🚀 Production mode: Calling Nkwa Pay API');
    const disbursementResult = await nkwaPayService.createDisbursement({
      transactionId: savedPayment.transactionId,
      amount: providerAmount,
      currency: 'XAF',
      serviceProviderPhone: paymentData.serviceProviderPhone,
      reference: savedPayment.reference,
      description: paymentData.description || `Payment for service - ${savedPayment.reference}`,
      bookingId: paymentData.bookingId,
      clientId: paymentData.clientId,
      serviceProviderId: paymentData.serviceProviderId,
      disbursementType: paymentData.disbursementType || 'payout'
    });

    if (disbursementResult.success) {
      // Update payment with Nkwa Pay transaction ID and status
      savedPayment.nkwaTransactionId = disbursementResult.nkwaTransactionId;
      savedPayment.nkwaStatus = 'PENDING';
      savedPayment.status = 'processing';
      savedPayment.nkwaResponse = disbursementResult.data;
      savedPayment.processedAt = new Date();
      
      await savedPayment.save();

      res.status(201).json({
        success: true,
        message: "✅ Payment created and disbursement initiated successfully",
        data: {
          payment: savedPayment,
          disbursement: disbursementResult.data
        }
      });
    } else {
      // Disbursement failed, update payment status
      savedPayment.status = 'failed';
      savedPayment.nkwaResponse = disbursementResult.error;
      savedPayment.failedAt = new Date();
      await savedPayment.save();

      console.error('❌ Nkwa Pay API error:', disbursementResult.error);
      
      res.status(400).json({
        success: false,
        message: "Payment created but disbursement failed",
        error: disbursementResult.error,
        data: savedPayment
      });
    }

  } catch (error) {
    console.error("❌ Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating payment",
      error: error.message
    });
  }
}

// Get all payments with filtering and pagination
export async function allPayments(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      clientId,
      serviceProviderId,
      startDate,
      endDate
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (clientId) filter.clientId = clientId;
    if (serviceProviderId) filter.serviceProviderId = serviceProviderId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate('clientId', 'name email phone')
      .populate('serviceProviderId', 'name email phone')
      .populate('bookingId', 'serviceType date')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPayments: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching payments",
      error: error.message
    });
  }
}

// Get single payment
export async function onePayment(req, res) {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findById(id)
      .populate('clientId', 'name email phone')
      .populate('serviceProviderId', 'name email phone')
      .populate('bookingId', 'serviceType date status');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching payment",
      error: error.message
    });
  }
}

// Check payment status
export async function checkPaymentStatus(req, res) {
  try {
    const { id } = req.params;
    
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // If payment has Nkwa transaction ID, check status with Nkwa Pay
    if (payment.nkwaTransactionId && payment.status === 'processing') {
      const statusResult = await nkwaPayService.checkDisbursementStatus(payment.nkwaTransactionId);
      
      if (statusResult.success) {
        // Update payment status based on Nkwa Pay status
        const nkwaStatus = statusResult.data.status;
        payment.nkwaStatus = nkwaStatus;
        
        if (nkwaStatus === 'SUCCESSFUL' && payment.status !== 'successful') {
          payment.status = 'successful';
          payment.completedAt = new Date();
        } else if (nkwaStatus === 'FAILED' && payment.status !== 'failed') {
          payment.status = 'failed';
          payment.failedAt = new Date();
        }
        
        payment.nkwaResponse = statusResult.data;
        await payment.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment status checked successfully",
      data: payment
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while checking payment status",
      error: error.message
    });
  }
}

// Webhook endpoint for Nkwa Pay notifications
export async function handleWebhook(req, res) {
  try {
    const webhookData = req.body;
    
    // Verify webhook signature (implement proper verification)
    const signature = req.headers['x-signature'];
    if (!nkwaPayService.verifyWebhookSignature(webhookData, signature)) {
      return res.status(401).json({
        success: false,
        message: "Invalid webhook signature"
      });
    }

    // Process webhook
    const result = await nkwaPayService.processWebhook(webhookData);

    if (result.success) {
      res.status(200).json({ success: true, message: "Webhook processed successfully" });
    } else {
      res.status(400).json({
        success: false,
        message: "Error processing webhook",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error processing webhook",
      error: error.message
    });
  }
}

// Health check endpoint
export async function healthCheck(req, res) {
  res.status(200).json({
    success: true,
    message: "✅ Payment service is healthy",
    timestamp: new Date().toISOString(),
    service: "Nkwa Pay Disbursement API"
  });
}

export default {
  createPayment,
  allPayments,
  onePayment,
  checkPaymentStatus,
  handleWebhook,
  healthCheck
};