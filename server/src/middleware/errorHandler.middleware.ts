import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
import { sendError } from "../utils/response.js";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 400
  ) {
    super(message);
  }
}

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, `Route not found: ${req.method} ${req.path}`, 404);
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return sendError(res, "Validation failed", 422, error.flatten());
  }

  if (error instanceof AppError) {
    return sendError(res, error.message, error.statusCode);
  }

  logger.error("Unhandled error", { error });
  return sendError(res, "Internal server error", 500);
}
