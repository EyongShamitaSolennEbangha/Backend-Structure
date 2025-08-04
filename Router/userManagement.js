import e, { Router } from "express";
import {allUsers, createUser, deleteUser, oneUser, updateUser} from '../Controller/authController.js'

const userRouter = Router()

userRouter.post('/register', createUser);
userRouter.get('/', allUsers);
userRouter.get('/:id', oneUser)
userRouter.put('/:id', updateUser)
userRouter.delete('/:id', deleteUser)







export default userRouter