import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";
import { sendError } from "../utils/response.js";
import type { AuthUser } from "../types/index.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return sendError(res, "Missing bearer token", 401);
  }

  try {
    req.user = jwt.verify(token, jwtConfig.accessSecret) as AuthUser;
    return next();
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }
}
