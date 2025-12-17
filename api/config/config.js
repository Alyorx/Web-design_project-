import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI;

const connectDB = async () => {
  // Mongoose handles the "cached connection" logic for you automatically
  await mongoose.connect(uri);
  console.log("Connected to MongoDB via Mongoose");
};

export default connectDB;