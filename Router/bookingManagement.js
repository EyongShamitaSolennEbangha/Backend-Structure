import { Router } from "express";
import {
  oneBooking,
  updateBooking,
  createBooking,
  allBookings,
  deleteBooking,
  providerBookings,
  clientBookings
} from "../Controller/bookingController.js";
import { authMiddleware } from "../Controller/authMiddleware.js"; 

const router = Router();

// Public routes
router.get("/", allBookings);
router.get("/:id", oneBooking);

// Protected routes
router.post("/", authMiddleware, createBooking);
router.put("/:id", authMiddleware, updateBooking);
router.delete("/:id", authMiddleware, deleteBooking);

// Specific user routes
router.get("/provider/:providerId", providerBookings);
router.get("/client/:clientId", clientBookings);

export default router;