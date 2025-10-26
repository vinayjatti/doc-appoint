import { Router } from "express";
import { sendWhatsApp } from "../utils/sendWhatsApp";

const router = Router();

router.post("/send", async (req, res) => {
  const { to, body } = req.body; 
    try{
        await sendWhatsApp(to, body);
        return res.status(200).json({ message: "WhatsApp message sent successfully" });
    }catch(err){
        return res.status(500).json({ error: "Failed to send WhatsApp message" });
    }
})

export default router;