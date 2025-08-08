import review from '../Models/Review.js'
import Review from '../Models/Review.js'
import booking from '../Models/Booking.js'
import User from '../Models/User.js'



const createnewReview = async(reviewData)=>{
    const newReview = new Review({

        booking_id : reviewData.booking_id,
        rating: reviewData.rating,
        review: reviewData.review,                                               
        user_id: reviewData.user_id,
    })

     const savedReview = await newReview.save()
    return savedReview
}



export async function createReview(req , res) {
    try{
        const reviewData = req.body
        const newReview = await createTask(reviewData)
        res.status(201).json({
            message: "Review created successfully"
            , data: newReview
        })
    }

    catch(error){
        console.error("Error creating Review:", error)
        res.status(500).json({
            message: "Internal server error while creating Review",
            error: error.message
        })
    }
    
}



export async function allReviews(req, res) {
    try{
        const Reviews = await User.find()
        res.status(200).json({
            message: "All Reviews fetched successfully",
            data: Reviews
        })
    }
    catch(error){
        console.error("Error fetching Reviews:", error);
        res.status(500).json({
            message: "Internal server error while fetching Reviews",
            error: error.message
        }) 
    }
}



export async function oneReview(req, res){
    try{
        const id  = req.params.id;
        const Review = await User.findById(id);
        if(!Event){
            res.status(404).json({
                message: "Review not found"
            })
        }
        res.status(200).json({
            message: "Review fetched successfully",
            data: Review
        })
    }

    catch(error){
        console.error("Error fetching Review:", error);
        res.status(500).json({
            message: "Internal server error while fetching Review",
            error:error.message
        })
    }
}


export default { createnewReview }