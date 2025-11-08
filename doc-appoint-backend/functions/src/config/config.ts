import * as dotenv from "dotenv";
import * as functions from "firebase-functions";

dotenv.config(); // loads .env if running locally

const getEnv = (key: string): string => {
  const firebaseVal = functions.config().app?.[key.toLowerCase()];
  const localVal = process.env[key];
  return firebaseVal || localVal || "";
};

export const CONFIG = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  WHATSAPP_FROM: process.env.WHATSAPP_FROM,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,
  GOOGLE_API_URL: process.env.GOOGLE_API_URL,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  NODE_ENV: process.env.NODE_ENV || "development",
};

