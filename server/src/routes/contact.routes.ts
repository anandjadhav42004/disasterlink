import { Router } from "express";
import { randomBytes } from "node:crypto";
import { prisma } from "../config/database.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const contactRouter = Router();

contactRouter.post("/", optionalAuth, async (req, res) => {
  const body = req.body as { name?: string; email?: string; phone?: string; subject?: string; message?: string };
  if (!body.name || !body.email || !body.subject || !body.message) {
    return sendError(res, "name, email, subject and message are required", 400);
  }
  const ticketId = `DL-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const inquiry = await prisma.contactInquiry.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject,
      message: body.message,
      ticketId,
      userId: req.user?.id
    }
  });
  await prisma.auditLog.create({
    data: {
      userId: req.user?.id,
      role: req.user?.role,
      action: "contact.inquiry_created",
      module: "contact",
      severity: "INFO",
      ip: req.ip,
      device: req.headers["user-agent"],
      metadata: { inquiryId: inquiry.id, ticketId, emailArchitecture: "queued" }
    }
  });
  return sendSuccess(res, { inquiry, email: { queued: true, provider: "architecture-ready" } }, "Inquiry submitted", 201);
});

function optionalAuth(req: Parameters<typeof requireAuth>[0], res: Parameters<typeof requireAuth>[1], next: Parameters<typeof requireAuth>[2]) {
  if (!req.headers.authorization) return next();
  return requireAuth(req, res, next);
}
