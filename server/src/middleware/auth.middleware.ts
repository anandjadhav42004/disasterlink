import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { jwtConfig } from "../config/jwt.js";
import { sendError } from "../utils/response.js";
import type { AuthUser } from "../types/index.js";
import { resolveAccess } from "../modules/permissions/rbac.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return sendError(res, "Missing bearer token", 401);
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret) as AuthUser;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        primaryRole: { include: { permissions: { include: { permission: true } } } },
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } }
      }
    });

    if (!user) return sendError(res, "User not found", 401);
    if (user.status === "suspended" || user.deactivatedAt) {
      return sendError(res, "Account is not active", 403);
    }

    const roles = [
      ...user.roles.map((entry) => entry.role),
      ...(user.primaryRole ? [user.primaryRole] : [])
    ].filter((role, index, all) => all.findIndex((item) => item.id === role.id) === index);

    const access = resolveAccess(user.role, roles);
    req.access = access;
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      roles: access.roles.map((role) => role.slug),
      permissions: access.permissions,
      hierarchyLevel: access.hierarchyLevel,
      accessScope: access.accessScope,
      dashboards: access.dashboards,
      modules: access.modules
    };
    return next();
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }
}
