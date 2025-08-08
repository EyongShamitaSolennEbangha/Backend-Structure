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
import bookingRouter from "./Router/bookingManagement.js";
import reviewRouter from "./Router/reviewManagement.js";
import paymentRouter from "./Router/paymentManagement.js";

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


app.use('/newBooking',   bookingRouter)
app.use('/allBooking ', bookingRouter)
app.use('/oneBooking', bookingRouter)
app.use('/updateBooking',bookingRouter)
app.use('/deleteBooking',bookingRouter)


app.use('/newPayment', paymentRouter)
app.use('/allPayment', paymentRouter)
app.use('/onepayment', paymentRouter)



// Payment endpoint for your frontend
app.post("/api/process-payment", async (req, res) => {
  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || isNaN(amount) || amount < 100) {
    return res.status(400).json({ status: "error", message: "Invalid phone number or amount" });
  }

  try {
    const response = await axios.post("https://api.pay.mynkwa.com/collect", {
      phoneNumber,
      amount
    }, {
      headers: {
        "X-API-Key": "oIWEtwVuqfPwfglr89ODz",
        "Content-Type": "application/json"
      }
    });

    res.status(200).json({
      status: "success",
      message: "Payment initiated successfully!",
      response: response.data
    });
  } catch (error) {
    console.error("Payment error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Payment processing failed",
      details: error.response?.data || error.message
    });
  }
});


// const response = await fetch("http://localhost:YOUR_PORT/api/process-payment", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     "X-API-Key": "oIWEtwVuqfPwfglr89ODz"
//   },
//   body: JSON.stringify({ phoneNumber, amount }),
// });








app.use('/newReview',  reviewRouter)
app.use('/allReview', reviewRouter)
app.use('/oneReview', reviewRouter)




app.listen(3000, () => {
  console.log("Port Is Running");
});
