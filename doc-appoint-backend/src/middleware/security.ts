import helmet from "helmet";
import cors from "cors";
import { Express } from "express";

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:3000",        // local React app
  "http://localhost:8080", 
  "https://yourdomain.com",       // production frontend
  "https://staging.yourdomain.com",
  "https://doc-appoint-frontend.fly.dev"
];

export const applySecurityMiddleware = (app: Express): void => {
  // ✅ 1. Helmet for general HTTP header hardening
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", ...allowedOrigins],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false, // for compatibility (optional)
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // ✅ 2. CORS restriction (only allow specific hosts)
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true); // allow Postman or server-to-server
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error("CORS: Not allowed by policy"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
};