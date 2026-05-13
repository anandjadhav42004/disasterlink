import type { Response } from "express";

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "OK",
  statusCode = 200,
  pagination?: Pagination
) {
  return res.status(statusCode).json({ success: true, data, message, pagination });
}

export function sendError(res: Response, message: string, statusCode = 400, details?: unknown) {
  return res.status(statusCode).json({ success: false, message, details });
}
