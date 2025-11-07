import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config(); 

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.WHATSAPP_FROM; // e.g. +14155238886

// ✅ Validate credentials before creating client
if (!accountSid || !authToken) {
  throw new Error(
    "❌ Missing Twilio credentials. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env"
  );
}

const client = twilio(accountSid, authToken);

// ✅ Function to send WhatsApp message (with or without template)
export const sendWhatsApp = async (to: string, body?: string): Promise<void> => {
  try {
    const message = await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:${to}`,
      body: body || "Hello from Twilio!",
    });

    console.log(`✅ WhatsApp message sent! SID: ${message.sid}`);
  } catch (err) {
    console.error("❌ WhatsApp message failed:", err);
  }
};

