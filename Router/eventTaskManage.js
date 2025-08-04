import e, { Router } from "express";
import { createnewTask , allTask, oneTask,updateTask, deleteTask} from "../Controller/eventtaskController.js";



const taskRouter = Router()

taskRouter.post('/newTask',  createnewTask)
taskRouter.get('/allTask', allTask)
taskRouter.get('/oneTask', oneTask)
taskRouter.put('/updateTask',updateTask)
taskRouter.delete('/deleteTask',deleteTask)



export default taskRouter