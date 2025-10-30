import axios from 'axios';

class NkwaPayService {
  constructor() {
    this.baseURL = process.env.NKWA_PAY_PRODUCTION_URL || 'https://api.pay.mynkwa.com/';
    this.apiKey = process.env.NKWA_PAY_API_KEY || 'test_api_key_development';
    this.webhookSecret = process.env.NKWA_PAY_WEBHOOK_SECRET || 'test_webhook_secret';
  }

  // Format phone number for Nkwa Pay (Cameroon format: 237XXXXXXXXX)
  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If number starts with 6 or 7, assume it's Cameroonian
    if (cleaned.startsWith('6') || cleaned.startsWith('7')) {
      // It's a local number without country code
      return `237${cleaned}`;
    } else if (cleaned.startsWith('237')) {
      // It already has country code
      return cleaned;
    } else if (cleaned.startsWith('+237')) {
      // Remove the + and return
      return cleaned.substring(1);
    }
    
    throw new Error('Invalid phone number format for Cameroon');
  }

  // Determine provider from phone number
  getProviderFromPhoneNumber(phoneNumber) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // MTN numbers start with 2376, Orange with 2377
    if (formatted.startsWith('2376')) {
      return 'mtn';
    } else if (formatted.startsWith('2377')) {
      return 'orange';
    }
    throw new Error('Could not determine mobile money provider from phone number');
  }

  // Create disbursement to service provider
  async createDisbursement(paymentData) {
    try {
      // If in development mode with test API key, simulate success
      if (process.env.NODE_ENV === 'development' && this.apiKey.includes('test')) {
        console.log('🔧 Development mode: Simulating Nkwa Pay API call');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          data: {
            id: `NKWA_${Date.now()}`,
            status: 'PENDING',
            amount: paymentData.amount,
            recipientPhoneNumber: this.formatPhoneNumber(paymentData.serviceProviderPhone),
            reference: paymentData.reference,
            simulated: true
          },
          nkwaTransactionId: `NKWA_${Date.now()}`
        };
      }

      const formattedPhone = this.formatPhoneNumber(paymentData.serviceProviderPhone);
      const provider = this.getProviderFromPhoneNumber(paymentData.serviceProviderPhone);

      const disbursementPayload = {
        amount: paymentData.amount,
        currency: paymentData.currency || 'XAF',
        recipientPhoneNumber: formattedPhone,
        provider: provider.toUpperCase(),
        reference: paymentData.reference,
        description: paymentData.description || `Payment for service - ${paymentData.reference}`,
        metadata: {
          paymentId: paymentData.transactionId,
          bookingId: paymentData.bookingId,
          clientId: paymentData.clientId,
          serviceProviderId: paymentData.serviceProviderId,
          disbursementType: paymentData.disbursementType || 'payout'
        }
      };

      console.log('Sending disbursement to Nkwa Pay:', {
        ...disbursementPayload,
        recipientPhoneNumber: `${disbursementPayload.recipientPhoneNumber.substring(0, 6)}...`
      });

      const response = await axios.post(
        `${this.baseURL}disbursements`,
        disbursementPayload,
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      return {
        success: true,
        data: response.data,
        nkwaTransactionId: response.data.id
      };

    } catch (error) {
      console.error('Nkwa Pay disbursement error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data || error.message,
        statusCode: error.response?.status || 500
      };
    }
  }

  // Check disbursement status
  async checkDisbursementStatus(nkwaTransactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}disbursements/${nkwaTransactionId}`,
        {
          headers: {
            'X-API-KEY': this.apiKey
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error checking disbursement status:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Verify webhook signature (for security)
  verifyWebhookSignature(payload, signature) {
    // Implement webhook signature verification
    // This should match your Nkwa Pay webhook security settings
    return true; // Implement proper verification in production
  }

  // Process webhook notification
  async processWebhook(webhookData) {
    try {
      const { data } = webhookData;
      
      // Update payment status based on webhook data
      const Payment = require('../Models/Payment').default;
      const payment = await Payment.findOne({ nkwaTransactionId: data.id });
      
      if (!payment) {
        console.error('Payment not found for webhook:', data.id);
        return { success: false, error: 'Payment not found' };
      }

      // Update payment status based on Nkwa Pay status
      payment.nkwaStatus = data.status;
      
      switch (data.status) {
        case 'SUCCESSFUL':
          payment.status = 'successful';
          payment.completedAt = new Date();
          break;
        case 'FAILED':
          payment.status = 'failed';
          payment.failedAt = new Date();
          break;
        case 'PENDING':
          payment.status = 'processing';
          break;
      }

      payment.nkwaResponse = data;
      await payment.save();

      // You can trigger additional actions here (notifications, etc.)
      await this.handlePaymentStatusUpdate(payment);

      return { success: true };

    } catch (error) {
      console.error('Error processing webhook:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle payment status updates
  async handlePaymentStatusUpdate(payment) {
    // Implement additional actions when payment status changes
    // Such as sending notifications, updating bookings, etc.
    
    if (payment.status === 'successful') {
      console.log(`Payment ${payment.transactionId} completed successfully`);
      // Send success notification to service provider
    } else if (payment.status === 'failed') {
      console.log(`Payment ${payment.transactionId} failed`);
      // Send failure notification and potentially retry logic
    }
  }
}

export default new NkwaPayService();