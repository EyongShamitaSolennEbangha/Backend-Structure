import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  console.log("Connecting to DB using URI:", process.env.MONGO_URI); 

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database Connected ");
  } catch (error) {
    console.error("Failed to Connect DataBase ", error);
    process.exit(1);
  }
};

export default connectDB;



