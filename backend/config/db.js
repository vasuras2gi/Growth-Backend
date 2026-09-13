// // backend/config/db.js
// import mongoose from 'mongoose';

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI);
//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         process.exit(1);
//     }
// };

// export default connectDB;


import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Pure safety ke liye connect file ke andar bhi dotenv backup trigger kar dete hain
dotenv.config(); 

const connectDB = async () => {
  try {
    // 1. Hard Check: Agar process.env khali hai toh local backup string check karein
    const connectionString = process.env.MONGO_URI || "mongodb+srv://vasustark8_db_user:b82SP9cWpehsMC4E@cluster0.ypixffk.mongodb.net/?retryWrites=true&w=majority";

    if (!connectionString || connectionString.includes("undefined")) {
      console.error("❌ Critical: MongoDB URI string memory mein nahi mili.");
      return; 
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(connectionString);
    console.log("🚀 MongoDB Connected Successfully!");

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};

export default connectDB;