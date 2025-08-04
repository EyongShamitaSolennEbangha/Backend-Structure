
import Event from "../Models/Event.js"

const createEvent = async(eventData)=>{
    const newEvent = new Event({
        user_id: eventData.user_id,
        eventType: eventData.eventType,
        eventDate: eventData.eventDate,
        eventTime: eventData.eventTime,
        location: eventData.location,
        guest: eventData.guest,
        status: eventData.status,
    })
    const savedEvent = await newEvent.save()
    return savedEvent
}

export async function createnewEvent(req , res) {
    try{
        const eventData = req.body
        const newEvent = await createEvent(eventData)
        res.status(201).json({
            message: "Event created successfully"
            , data: newEvent
        })
    }

    catch(error){
        console.error("Error creating event:", error)
        res.status(500).json({
            message: "Internal server error while creating event",
            error: error.message
        })
    }
    
}




export async function allEvent(req, res) {
    try{
        const events = await User.find()
        res.status(200).json({
            message: "All Event fetched successfully",
            data: events
        })
    }
    catch(error){
        console.error("Error fetching Events:", error);
        res.status(500).json({
            message: "Internal server error while fetching Events",
            error: error.message
        }) 
    }
}



export async function oneEvent(req, res){
    try{
        const id  = req.params.id;
        const Event = await User.findById(id);
        if(!Event){
            res.status(404).json({
                message: "Event not found"
            })
        }
        res.status(200).json({
            message: "Event fetched successfully",
            data: Event
        })
    }

    catch(error){
        console.error("Error fetching Event:", error);
        res.status(500).json({
            message: "Internal server error while fetching Event",
            error:error.message
        })
    }
}




export async function updateEvent(req,rea) {
    try{
        const id = req.params.id;
        const updateData = req.body;
        const updateEvent = await User.findByIdAndUpdate(id, updateData, { new: true})
        if(!updateEvent){
            res.status(404).json({
                message: "Event not Updated"
            })
        }
        res.status(200).json({
            message: "Event Updated",
            data: updateEvent
        })
    }
    catch(error){
        console.error("Error updating  Event:", error)
        res.status(500).json({
            message: "Internal server error while updating Event",
            error: error.message
        })
    }
    
}





export async function deleteEvent(params) {
    try{
        const id = req.params.id;
        const deleteEvent = await User.findByIdAndDelete(id)
        if(!deleteEvent){
            res.status(400).json({
                message: "Event not found"

            })
        }
        res.json({
            message: "Event Deleted"
        })
    }

    catch(error){
        console.error("Error deleting Event:", error)
        res.status(500).json({
            message: "Internal server error while deleting  Event",
            error: error.message
        })
    }
    
}


export default { createEvent } 