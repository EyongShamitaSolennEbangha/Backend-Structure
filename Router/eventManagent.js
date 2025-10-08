import express from "express";
import {
  createEvent,
  allEvents,
  oneEvent,
  updateEvent,
  deleteEvent,
  getEventsByDateRange,
  getUpcomingEvents,
  searchEvents
} from "../Controller/eventController.js";

const router = express.Router();

// Basic CRUD routes
router.get("/allevents", allEvents);
router.get("/event/:id", oneEvent);
router.put("/event/:id", updateEvent);
router.delete("/event/:id", deleteEvent);
router.post("/newevent", createEvent);

// Additional utility routes
router.get("/events/date-range", getEventsByDateRange);
router.get("/events/upcoming", getUpcomingEvents);
router.get("/events/search", searchEvents);

export default router;