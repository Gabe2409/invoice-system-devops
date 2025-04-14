import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(uri);

    console.log("✅ MongoDB connected successfully.");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  }
};

// Handle connection errors after initial connection
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

export default connectDB;
