import type { Response } from "express";

export const sendSuccess = (res: Response, data: unknown, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data, message });
};

export const sendError = (res: Response, message = "Error", statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};
