import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { assignRole, ensureDefaultRbac } from "../modules/roles/roles.service.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { emitToAll, emitToUser } from "../sockets/index.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  district: true,
  state: true,
  country: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true
};

export async function listUsers(req: Request, res: Response) {
  const { search, role, status, district } = req.query;
  const users = await prisma.user.findMany({
    where: {
      role: role && role !== "all" ? String(role) : undefined,
      status: status && status !== "all" ? String(status) : undefined,
      district: district && district !== "all" ? String(district) : undefined,
      OR: search
        ? [
            { name: { contains: String(search), mode: "insensitive" } },
            { email: { contains: String(search), mode: "insensitive" } },
            { district: { contains: String(search), mode: "insensitive" } }
          ]
        : undefined
    },
    select: publicUserSelect,
    orderBy: { createdAt: "desc" },
    take: 250
  });
  return sendSuccess(res, users, "Users loaded");
}

export async function createUser(req: Request, res: Response) {
  await ensureDefaultRbac();
  const body = req.body as { name?: string; email?: string; phone?: string; role?: string; district?: string; state?: string; permissions?: string[] };
  if (!body.name || !body.email || !body.phone) return sendError(res, "name, email and phone are required", 400);
  const role = await prisma.role.findUnique({ where: { slug: body.role ?? "citizen" } });
  if (!role) return sendError(res, "Role not found", 400);
  const temporaryPassword = randomBytes(9).toString("base64url");
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: await bcrypt.hash(temporaryPassword, 12),
      role: role.slug,
      primaryRoleId: role.id,
      district: body.district,
      state: body.state,
      status: "pending",
      roles: { create: { roleId: role.id, district: body.district, state: body.state, country: "India", assignedBy: req.user?.id } },
      volunteerProfile: role.slug === "volunteer" ? { create: {} } : undefined
    },
    select: publicUserSelect
  });
  await audit(req, "users.create", "HIGH", { userId: user.id, role: user.role, invite: "email", permissions: body.permissions ?? [] });
  return sendSuccess(res, { user, invitation: { delivery: "email", temporaryPassword } }, "User invited", 201);
}

export async function updateUser(req: Request, res: Response) {
  const id = String(req.params.id);
  const body = req.body as { role?: string; district?: string; state?: string; status?: string; name?: string; phone?: string };
  if (body.role) await assignRole(id, body.role, req.user?.id, { district: body.district, state: body.state, country: "India" });
  const user = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      phone: body.phone,
      district: body.district,
      state: body.state,
      status: body.status
    },
    select: publicUserSelect
  });
  if (body.status === "suspended") {
    await prisma.refreshToken.deleteMany({ where: { userId: id } });
    await prisma.activeSession.deleteMany({ where: { userId: id } });
    emitToUser(id, "force-logout", { reason: "account-suspended" });
  }
  await audit(req, "users.update", "HIGH", { userId: id, ...body });
  emitToAll("users-update", { action: "updated", user });
  return sendSuccess(res, user, "User updated");
}

export async function bulkSuspend(req: Request, res: Response) {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : [];
  if (!ids.length) return sendError(res, "ids are required", 400);
  await prisma.user.updateMany({ where: { id: { in: ids } }, data: { status: "suspended" } });
  await prisma.refreshToken.deleteMany({ where: { userId: { in: ids } } });
  await prisma.activeSession.deleteMany({ where: { userId: { in: ids } } });
  ids.forEach((id: string) => emitToUser(id, "force-logout", { reason: "bulk-suspend" }));
  await audit(req, "users.bulk_suspend", "CRITICAL", { ids });
  emitToAll("users-update", { action: "bulk-suspended", ids });
  return sendSuccess(res, { ids }, "Users suspended");
}

export async function deleteUser(req: Request, res: Response) {
  const id = String(req.params.id);
  const user = await prisma.user.update({
    where: { id },
    data: { status: "deleted", deactivatedAt: new Date() },
    select: publicUserSelect
  });
  await prisma.refreshToken.deleteMany({ where: { userId: id } });
  await prisma.activeSession.deleteMany({ where: { userId: id } });
  emitToUser(id, "force-logout", { reason: "account-deleted" });
  await audit(req, "users.delete", "CRITICAL", { userId: id });
  return sendSuccess(res, user, "User deactivated");
}

export async function triggerPasswordReset(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: String(req.params.id) } });
  if (!user) return sendError(res, "User not found", 404);
  const temporaryPassword = randomBytes(9).toString("base64url");
  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(temporaryPassword, 12), status: "pending" }
  });
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await audit(req, "users.password_reset", "HIGH", { userId: user.id, delivery: "email" });
  emitToUser(user.id, "force-logout", { reason: "password-reset" });
  return sendSuccess(res, { delivery: "email", temporaryPassword }, "Password reset initiated");
}

export async function updateProfile(req: Request, res: Response) {
  const body = req.body as {
    name?: string;
    phone?: string;
    district?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    emergencyContacts?: unknown;
    medicalInfo?: unknown;
    preferences?: unknown;
  };
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...body,
      emergencyContacts: body.emergencyContacts as Prisma.InputJsonValue | undefined,
      medicalInfo: body.medicalInfo as Prisma.InputJsonValue | undefined,
      preferences: body.preferences as Prisma.InputJsonValue | undefined
    },
    select: publicUserSelect
  });
  await audit(req, "users.profile_update", "INFO", { userId: user.id });
  return sendSuccess(res, user, "Profile updated");
}

export async function deactivateAccount(req: Request, res: Response) {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { status: "deactivated", deactivatedAt: new Date() },
    select: publicUserSelect
  });
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await prisma.activeSession.deleteMany({ where: { userId: user.id } });
  await audit(req, "users.self_deactivate", "HIGH", { userId: user.id });
  return sendSuccess(res, user, "Account deactivated");
}

async function audit(req: Request, action: string, severity: string, metadata: object) {
  await prisma.auditLog.create({
    data: {
      userId: req.user?.id,
      role: req.user?.role,
      action,
      module: "users",
      severity,
      ip: req.ip,
      device: req.headers["user-agent"],
      metadata
    }
  });
}
