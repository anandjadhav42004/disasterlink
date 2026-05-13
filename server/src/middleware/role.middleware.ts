import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { sendError } from "../utils/response.js";

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "Forbidden", 403);
    }

    return next();
  };
}
