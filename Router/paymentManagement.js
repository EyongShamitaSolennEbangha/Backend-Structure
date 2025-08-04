import e, { Router } from "express";
import { createTask , allTask, oneTask,updateTask, deleteTask} from "../Controller/eventtaskController.js";



const paymentRouter = Router()

paymentRouter.post('/newTask',  createTask)
paymentRouter.get('/allTask', allTask)
paymentRouter.get('/oneTask', oneTask)





export default paymentRouter




