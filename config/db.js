import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    // Use single MONGO_URI instead of dev/prod split
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    console.log(`Connecting to DB using URI: ${uri}`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("Database Connected Successfully ✅");
  } catch (error) {
    console.error("❌ Failed to Connect Database:", error.message);
    process.exit(1);
  }
};

export default connectDB;



