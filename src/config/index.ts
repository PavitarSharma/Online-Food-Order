import { config } from "dotenv";
config();

export const MONGO_URI = process.env.MONGO_URI as string;
export const APP_SECRET = process.env.JWT_TOKEN_SECRET as string;

export const PORT = process.env.PORT || 8000;
