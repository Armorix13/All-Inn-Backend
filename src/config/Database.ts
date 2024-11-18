import mongoose from "mongoose";

const DbConnect = async () => {
  try {
    const url: any = process.env.MONGODB_URI;
    await mongoose.connect(url);
    console.log("Connected to MongoDB", url);
  } catch (error) {
    throw error;
  }
};
export default DbConnect;
