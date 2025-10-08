import Payment from "../Models/Payment.js";
import Booking from "../Models/Booking.js";

// Create a new payment
const createnewPayment = async (paymentData) => {
  // Here you can add commission calculation logic before saving
  const commissionRate = 0.03; // 3%
  const commissionAmount = paymentData.amount * commissionRate;
  const amountAfterCommission = paymentData.amount - commissionAmount;

  const newPayment = new Payment({
    booking_id: paymentData.booking_id,
    service_provider_id: paymentData.service_provider_id,
    amount: paymentData.amount,
    commission: commissionAmount,
    paid_to_provider: amountAfterCommission,
    phoneNumber: paymentData.phoneNumber,
    payment_date: new Date(),
  });

  // TODO: Integrate actual payment API call here to send money to provider's mobile money

  const savedPayment = await newPayment.save();
  return savedPayment;
};

export async function createPayment(req, res) {
  try {
    const paymentData = req.body;

    // Validate booking exists
    const bookingExists = await Booking.findById(paymentData.booking_id);
    if (!bookingExists) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const newPayment = await createnewPayment(paymentData);

    res.status(201).json({
      message: "Payment created successfully",
      data: newPayment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      message: "Internal server error while creating payment",
      error: error.message,
    });
  }
}

export async function allPayments(req, res) {
  try {
    const payments = await Payment.find();
    res.status(200).json({
      message: "All payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      message: "Internal server error while fetching payments",
      error: error.message,
    });
  }
}

export async function onePayment(req, res) {
  try {
    const id = req.params.id;
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json({
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      message: "Internal server error while fetching payment",
      error: error.message,
    });
  }
}

export default { createnewPayment, createPayment, allPayments, onePayment };
