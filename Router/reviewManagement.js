import e, { Router } from "express";
import { createReview, allReviews, oneReview } from "../Controller/reviewController.js";



const reviewRouter = Router()

reviewRouter.post('/newReview',  createReview)
reviewRouter.get('/allReview', allReviews)
reviewRouter.get('/oneReview', oneReview)


export default reviewRouter