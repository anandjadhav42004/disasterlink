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
    logger.error("Validation error", { error: error.flatten() });
    return sendError(res, "Validation failed", 422);
  }

  if (error instanceof AppError) {
    logger.error("Application error", { message: error.message, statusCode: error.statusCode });
    return sendError(res, error.message, error.statusCode);
  }

  logger.error("Unhandled error", { error });
  return sendError(res, "Internal server error", 500);
}
