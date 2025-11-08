import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import { CONFIG } from "../config/config.js";

dotenv.config();

export interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Access denied, no token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = CONFIG.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded; // attach user payload to request
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};