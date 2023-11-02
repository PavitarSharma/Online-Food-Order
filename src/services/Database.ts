import mongoose from "mongoose";
import { MONGO_URI } from "../config";

export default async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);

    console.log(`MongoDB Connected`);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
};
