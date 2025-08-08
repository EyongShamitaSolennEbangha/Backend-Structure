import booking from '../Models/Booking.js'
import Booking from '../Models/Booking.js'
import event from '../Models/Event.js'
import serviceprovider from  '../Models/ServiceProvider.js'

const createBooking = async(bookingData)=>{
    const newBooking = new Booking({
        event_id: bookingData.event_id,
        service_provider_id : bookingData.service_provider_id,
        booking_date : bookingData.booking_date,
        status : bookingData.status
    })

    const savedBooking = await Booking.save()
    return savedBooking
}



export async function createnewBooking(req , res) {
    try{
        const bookingData = req.body
        const newBooking = await createEvent(eventData)
        res.status(201).json({
            message: "Event created successfully"
            , data: newBooking
        })
    }

    catch(error){
        console.error("Error creating Booking :", error)
        res.status(500).json({
            message: "Internal server error while creating Booking",
            error: error.message
        })
    }
    
}




export async function allBooking(req, res) {
    try{
        const bookings = await User.find()
        res.status(200).json({
            message: "All Bookings fetched successfully",
            data: bookings
        })
    }
    catch(error){
        console.error("Error fetching Bookings:", error);
        res.status(500).json({
            message: "Internal server error while fetching Bookings",
            error: error.message
        }) 
    }
}



export async function oneBooking(req, res){
    try{
        const id  = req.params.id;
        const Booking = await User.findById(id);
        if(!Event){
            res.status(404).json({
                message: "Booking not found"
            })
        }
        res.status(200).json({
            message: "Booking fetched successfully",
            data: Event
        })
    }

    catch(error){
        console.error("Error fetching Booking:", error);
        res.status(500).json({
            message: "Internal server error while fetching Booking",
            error:error.message
        })
    }
}




export async function updateBooking(req,rea) {
    try{
        const id = req.params.id;
        const updateData = req.body;
        const updateBooking = await User.findByIdAndUpdate(id, updateData, { new: true})
        if(!updateBooking){
            res.status(404).json({
                message: "Booking not Updated"
            })
        }
        res.status(200).json({
            message: "Booking Updated",
            data: updateBooking
        })
    }
    catch(error){
        console.error("Error updating  Booking:", error)
        res.status(500).json({
            message: "Internal server error while updating Booking",
            error: error.message
        })
    }
    
}





export async function deleteBooking(params) {
    try{
        const id = req.params.id;
        const deleteBooking = await User.findByIdAndDelete(id)
        if(!deleteBooking){
            res.status(400).json({
                message: "Booking not found"

            })
        }
        res.json({
            message: "Booking Deleted"
        })
    }

    catch(error){
        console.error("Error deleting Booking:", error)
        res.status(500).json({
            message: "Internal server error while deleting  Booking",
            error: error.message
        })
    }
    
}


export default { createBooking }
