import rateLimit from "express-rate-limit";
import { SOS_RATE_LIMIT_PER_HOUR } from "../constants/index.js";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});

export const sosRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: SOS_RATE_LIMIT_PER_HOUR,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? "anonymous",
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "SOS rate limit exceeded" }
});
