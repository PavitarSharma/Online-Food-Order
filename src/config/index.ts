import { config } from "dotenv";
config();

export const MONGO_URI = process.env.MONGO_URI as string;

export const APP_SECRET = process.env.JWT_TOKEN_SECRET as string;

export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID as string;

export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN as string;

export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export const PORT = process.env.PORT || 8000;
