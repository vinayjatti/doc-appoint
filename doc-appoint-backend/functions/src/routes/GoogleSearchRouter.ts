import { Router } from "express";
import { sendWhatsApp } from "../utils/sendWhatsApp.js";
import { searchNearBy } from "../utils/GoogleSearchApi.js";

const router = Router();

router.post("/search", async (req, res) => {
    const { includeTypes, latitude, longitude } = req.body;
    await searchNearBy(includeTypes, latitude, longitude).then(async (places) => {
        return res.status(200).json(places);
    })
    .catch((err) => {
        return res.status(500).json({ error: err.message });
    });
})

export default router;