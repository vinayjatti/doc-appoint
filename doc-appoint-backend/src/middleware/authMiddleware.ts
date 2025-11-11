import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

export interface AuthRequest extends Request {
  user?: JwtPayload & { role?: string };
}

/**
 * Verify token middleware
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Access denied, no token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    const decoded = jwt.verify(token, secret) as JwtPayload & { role?: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * Verify admin middleware
 */
export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Access denied. Admins only." });
    return;
  }

  next();
};