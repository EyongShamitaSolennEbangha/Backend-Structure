import { Router } from "express";
import {
  allPayments,
  createPayment,
  onePayment,
  checkPaymentStatus,
  handleWebhook,
  healthCheck
} from "../Controller/paymentController.js";

const paymentRouter = Router();

// Health check route
paymentRouter.get("/health", healthCheck);

// Test route
paymentRouter.get("/test-payment", (req, res) => {
  res.json({
    success: true,
    message: "Payment API is working!",
    endpoints: {
      createPayment: "POST /api/payments",
      getPayments: "GET /api/payments", 
      getPayment: "GET /api/payments/:id",
      checkStatus: "GET /api/payments/:id/status"
    }
  });
});

// Payment routes
paymentRouter.post("/payments", createPayment);
paymentRouter.get("/payments", allPayments);
paymentRouter.get("/payments/:id", onePayment);
paymentRouter.get("/payments/:id/status", checkPaymentStatus);

// Webhook route (no authentication required for webhooks)
paymentRouter.post("/webhook/nkwa-pay", handleWebhook);

export default paymentRouter;
