import Event from "../Models/Event.js";
import EventVenue from "../Models/Eventvenue.js";

// Create Event - FIXED VERSION
export async function createEvent(req, res) {
  try {
    // Use req.body directly instead of eventData
    const { eventType, eventDate, Time, location, guest, contact, Decription, venue } = req.body;

    // Validation
    if (!eventType || !eventDate || !Time || !location || !venue) {
      return res.status(400).json({ 
        message: "Missing required fields" 
      });
    }

    const newEvent = new Event({
      eventType,
      eventDate,
      Time,
      location,
      guest: guest || [],
      contact: contact || [],
      Decription: Decription || "", // Fixed: using the correct variable from destructuring
      venue,
    });

    const savedEvent = await newEvent.save();
    
    // Optional: Also create a separate venue document
    if (venue) {
      await EventVenue.create({
        venuecapacity: venue.venuecapacity,
      });
    }
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to("events-room").emit("eventCreated", savedEvent);
      console.log("📢 Event created emitted via Socket.io");
    }
    
    res.status(201).json({
      message: "Event created successfully",
      data: savedEvent,
    });
   } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      message: "Internal server error while creating event",
      error: error.message,
    });
  }
}

// Get all events
export async function allEvents(req, res) {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    
    // Emit socket event for real-time updates (optional)
    const io = req.app.get('io');
    if (io) {
      console.log("📊 Events fetched, socket available");
    }
    
    res.status(200).json({
      message: "All events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      message: "Internal server error while fetching events",
      error: error.message,
    });
  }
}

// Get one event
export async function oneEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Emit socket event for real-time updates (optional)
    const io = req.app.get('io');
    if (io) {
      console.log("📊 Single event fetched, socket available");
    }
    
    res.status(200).json({
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      message: "Internal server error while fetching event",
      error: error.message,
    });
  }
}

// Update event
export async function updateEvent(req, res) {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to("events-room").emit("eventUpdated", updatedEvent);
      console.log("📢 Event updated emitted via Socket.io");
    }
    
    res.status(200).json({
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      message: "Internal server error while updating event",
      error: error.message,
    });
  }
}

// Delete event
export async function deleteEvent(req, res) {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to("events-room").emit("eventDeleted", req.params.id);
      console.log("📢 Event deleted emitted via Socket.io");
    }
    
    res.status(200).json({ 
      message: "Event deleted successfully",
      deletedId: req.params.id 
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      message: "Internal server error while deleting event",
      error: error.message,
    });
  }
}

// Additional utility functions

// Get events by date range
export async function getEventsByDateRange(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Start date and end date are required" 
      });
    }

    const events = await Event.find({
      eventDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ eventDate: 1, Time: 1 });

    res.status(200).json({
      message: "Events fetched successfully by date range",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events by date range:", error);
    res.status(500).json({
      message: "Internal server error while fetching events",
      error: error.message,
    });
  }
}

// Get upcoming events
export async function getUpcomingEvents(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const events = await Event.find({
      eventDate: { $gte: today }
    }).sort({ eventDate: 1, Time: 1 });

    res.status(200).json({
      message: "Upcoming events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({
      message: "Internal server error while fetching upcoming events",
      error: error.message,
    });
  }
}

// Get past events (for your EventHistoryDashboard)
export async function getPastEvents(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const events = await Event.find({
      eventDate: { $lt: today }
    }).sort({ eventDate: -1 });

    res.status(200).json({
      message: "Past events fetched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching past events:", error);
    res.status(500).json({
      message: "Internal server error while fetching past events",
      error: error.message,
    });
  }
}

// Search events
export async function searchEvents(req, res) {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        message: "Search query is required" 
      });
    }

    const events = await Event.find({
      $or: [
        { eventType: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { Decription: { $regex: query, $options: 'i' } }
      ]
    });

    res.status(200).json({
      message: "Events searched successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error searching events:", error);
    res.status(500).json({
      message: "Internal server error while searching events",
      error: error.message,
    });
  }
}
