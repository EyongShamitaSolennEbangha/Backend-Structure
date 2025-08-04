import e, { Router } from "express";
import { createnewEvent, allEvent,oneEvent,updateEvent,deleteEvent } from "../Controller/eventController.js";



const eventRouter = Router()

eventRouter.post('/newevent',  createnewEvent)
eventRouter.get('/allevents',allEvent)
eventRouter.get('/oneevent', oneEvent)
eventRouter.put('/updateevent',updateEvent)
eventRouter.delete('/deleteevent',deleteEvent)



export default eventRouter;
