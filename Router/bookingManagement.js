import e, { Router } from "express";
import { oneBooking, updateBooking , createnewBooking, allBooking,deleteBooking} from "../Controller/bookingController.js";



const bookingRouter = Router()

bookingRouter.post('/newBooking',  createnewBooking)
bookingRouter.get('/allBooking ', allBooking)
bookingRouter.get('/oneBooking', oneBooking)
bookingRouter.put('/updateBooking',updateBooking)
bookingRouter.delete('/deleteBooking',deleteBooking)

export default bookingRouter