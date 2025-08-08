import e, { Router } from "express";
import { allPayments, createPayment, onePayment } from "../Controller/paymentController.js";



const paymentRouter = Router()

paymentRouter.post('/newPayment', createPayment)
paymentRouter.get('/allPayment', allPayments)
paymentRouter.get('/onepayment', onePayment)





export default paymentRouter




