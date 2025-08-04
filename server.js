import express from "express";
import path from "path";
import connectDB from "./config/db.js";
import  userRouter  from "./Router/userManagement.js";
import servicerRouter from "./Router/serviceProvider.js";
import bodyParser from "body-parser";
import eventRouter from "./Router/eventManagent.js";
import taskRouter from "./Router/eventTaskManage.js";
import axios from "axios";
import cors from "cors"

const app = express();

connectDB();


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/user", userRouter);
app.use("/allusers", userRouter)
app.use("/oneUser", userRouter)
app.use("/",userRouter)
// app.use("/", (req, res) => {
//   res.send("Welcome to the User Management API");
// });

app.use("/servicer", servicerRouter)
app.use("/allserviceprovider", servicerRouter)
app.use("/oneserviceprovider", servicerRouter)
app.use("/updateServiceProvider", servicerRouter)
app.use("/deleteServiceProvider", servicerRouter)


app.use("/newevent", eventRouter)
app.use("/allevents", eventRouter)
app.use("/oneevent", eventRouter)
app.use("/updateevent", eventRouter)
app.use("/deleteevent", eventRouter)




app.use("/newTask", taskRouter)
app.use("/allTask", taskRouter)
app.use("/oneTask", taskRouter)
app.use("/updateTask", taskRouter)
app.use("/deleteTask", taskRouter)




app.listen(3000, () => {
  console.log("Port Is Running");
});
