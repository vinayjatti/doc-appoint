import { Request, Response, NextFunction } from "express";

export const verifyClientSecret = (req: Request, res: Response, next: NextFunction) => {
  const clientSecret = req.headers["x-app-auth"];
  const serverSecret = process.env.APP_CLIENT_SECRET;

  if (!serverSecret) {
    console.error("APP_CLIENT_SECRET is missing in environment variables!");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  if (!clientSecret || clientSecret !== serverSecret) {
    return res.status(403).json({ error: "Forbidden - Invalid Client Secret" });
  }

  next();
};