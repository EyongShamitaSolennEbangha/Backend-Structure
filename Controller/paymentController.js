
import payment from "../Models/Payment.js";
import Payment from "../Models/Payment.js"

const createPayment = async(paymentData)=>{
    const newpayment = new Payment({
        booking_id: paymentData.booking_id,
        event_id:paymentData.event_id,
        payment_method:paymentData.payment_method,
        amount:paymentData.amount,
        payment_date:paymentData.payment_date
    })

    const savedPayment = await newpayment.save()
    return savedPayment
};





export async function createPayment(req , res) {
    try{
        const paymentData = req.body
        const newpayment = await createTask(paymentData)
        res.status(201).json({
            message: "Task created successfully"
            , data: newpayment
        })
    }

    catch(error){
        console.error("Error creating payment:", error)
        res.status(500).json({
            message: "Internal server error while creating payment",
            error: error.message
        })
    }
    
}




export async function allPayments(req, res) {
    try{
        const payments = await User.find()
        res.status(200).json({
            message: "All Payments fetched successfully",
            data: payments
        })
    }
    catch(error){
        console.error("Error fetching Payments:", error);
        res.status(500).json({
            message: "Internal server error while fetching Payments",
            error: error.message
        }) 
    }
}



export async function onePayment(req, res){
    try{
        const id  = req.params.id;
        const Payment = await User.findById(id);
        if(!Event){
            res.status(404).json({
                message: "Payment not found"
            })
        }
        res.status(200).json({
            message: "Payment fetched successfully",
            data: payment
        })
    }

    catch(error){
        console.error("Error fetching Payment:", error);
        res.status(500).json({
            message: "Internal server error while fetching Payment",
            error:error.message
        })
    }
}


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route to handle payment request
app.post("/api/process-payment", async (req, res) => {
  const { phoneNumber, amount, cardNumber, cardName, expiryDate, cvv } = req.body;

  if (!phoneNumber || !amount || !cardNumber || !cardName || !expiryDate) {
    return res.status(400).json({ status: "error", message: "Missing required fields" });
  }

  try {
    const response = await axios.post("https://api.pay.staging.mynkwa.com/collect", {
      phoneNumber,
      amount,
      cardNumber,
      cardName,
      expiryDate,
      cvv,
    }, {
      headers: {
        "X-API-Key": "jdDNslBrLY6ygM-7fPGVf",
        "Content-Type": "application/json",
      },
    });

    res.status(200).json({
      status: "success",
      message: "Payment processed",
      response: response.data,
    });
  } catch (error) {
    console.error("Payment API error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Payment processing failed",
      details: error.response?.data || error.message,
    });
  }
});
