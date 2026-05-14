import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { randomBytes, randomInt } from "node:crypto";
import { prisma } from "../config/database.js";
import { jwtConfig } from "../config/jwt.js";
import {
  fcmTokenSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  ssoCallbackSchema,
  ssoStartSchema,
  verifyEmailSchema,
  verifyResetCodeSchema
} from "../validators/auth.validator.js";
import { sendSuccess, sendError } from "../utils/response.js";
import type { AuthUser } from "../types/index.js";
import { assignRole, dashboardForAccess, ensureDefaultRbac, resolveUserAccess } from "../modules/roles/roles.service.js";

function signAccessToken(user: Pick<AuthUser, "id" | "email" | "role">) {
  return jwt.sign(user, jwtConfig.accessSecret, { expiresIn: jwtConfig.accessExpiresIn } as SignOptions);
}

function signRefreshToken(user: Pick<AuthUser, "id" | "email" | "role">) {
  return jwt.sign(user, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn } as SignOptions);
}

function publicUser(user: {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  latitude: number | null;
  longitude: number | null;
  district: string | null;
  state: string | null;
  country: string | null;
  status?: string;
  emailVerified?: boolean;
}) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    latitude: user.latitude,
    longitude: user.longitude,
    district: user.district,
    state: user.state,
    country: user.country,
    status: user.status,
    emailVerified: user.emailVerified
  };
}

export async function register(req: Request, res: Response) {
  await ensureDefaultRbac();
  const input = registerSchema.parse(req.body);
  const userCount = await prisma.user.count();
  const requestedRole = userCount === 0 ? "super_admin" : input.role;
  const role = await prisma.role.findUnique({ where: { slug: requestedRole } });
  if (!role || !role.isActive) return sendError(res, "Selected role is not available", 400);
  if (userCount > 0 && role.hierarchyLevel >= 40 && req.user?.role !== "super_admin") {
    return sendError(res, "Administrative roles must be assigned by Super Admin", 403);
  }

  const password = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      password,
      role: role.slug,
      primaryRoleId: role.id,
      district: input.district,
      state: input.state,
      country: input.country ?? "India",
      latitude: input.latitude,
      longitude: input.longitude,
      roles: { create: { roleId: role.id, district: input.district, state: input.state, country: input.country ?? "India" } },
      volunteerProfile: role.slug === "volunteer" ? { create: {} } : undefined
    }
  });
  const access = await resolveUserAccess(user.id);
  const authUser = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  await persistRefreshToken(refreshToken, user.id, req);
  await audit(user.id, user.role, "auth.register", "auth", "INFO", req, { role: user.role });
  return sendSuccess(res, { user: publicUser(user), access, redirectTo: dashboardForAccess(access), accessToken, refreshToken }, "Registered", 201);
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    await audit(undefined, undefined, "auth.login_failed", "auth", "WARN", req, { email: input.email });
    return sendError(res, "Invalid credentials", 401);
  }
  if (user.status === "suspended" || user.deactivatedAt) {
    await audit(user.id, user.role, "auth.login_blocked", "auth", "WARN", req, { status: user.status });
    return sendError(res, "Account is not active. Contact your administrator.", 403);
  }
  const access = await resolveUserAccess(user.id);
  const authUser = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  await persistRefreshToken(refreshToken, user.id, req);
  await audit(user.id, user.role, "auth.login", "auth", "INFO", req, { role: user.role });
  return sendSuccess(res, { user: publicUser(user), access, redirectTo: dashboardForAccess(access), accessToken, refreshToken }, "Logged in");
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) return sendError(res, "Invalid refresh token", 401);
  const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as AuthUser;
  const access = await resolveUserAccess(decoded.id);
  const accessToken = signAccessToken(decoded);
  return sendSuccess(res, { accessToken, access }, "Token refreshed");
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  await prisma.activeSession.deleteMany({ where: { refreshToken } });
  return sendSuccess(res, null, "Logged out");
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
  if (!user) return sendError(res, "User not found", 404);
  const access = await resolveUserAccess(user.id);
  return sendSuccess(res, { user: publicUser(user), access, redirectTo: dashboardForAccess(access) }, "Profile loaded");
}

export async function updateFcmToken(req: Request, res: Response) {
  const { fcmToken } = fcmTokenSchema.parse(req.body);
  await prisma.user.update({ where: { id: req.user?.id }, data: { fcmToken } });
  return sendSuccess(res, null, "FCM token updated");
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = forgotPasswordSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  const code = createOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  if (user) {
    await prisma.passwordResetCode.create({
      data: {
        email,
        userId: user.id,
        codeHash: await bcrypt.hash(code, 12),
        tokenHash: await bcrypt.hash(randomBytes(24).toString("hex"), 12),
        expiresAt
      }
    });
    await audit(user.id, user.role, "auth.password_reset_requested", "auth", "INFO", req, { email });
  }

  return sendSuccess(
    res,
    {
      expiresAt,
      delivery: ["email"],
      ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {})
    },
    "If the account exists, a reset code has been sent."
  );
}

export async function verifyResetCode(req: Request, res: Response) {
  const { email, code } = verifyResetCodeSchema.parse(req.body);
  const record = await findUsableCode(email, "password_reset");
  if (!record || !(await bcrypt.compare(code, record.codeHash))) {
    if (record) await prisma.passwordResetCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return sendError(res, "Invalid or expired reset code", 400);
  }
  return sendSuccess(res, { verified: true, expiresAt: record.expiresAt }, "Reset code verified");
}

export async function resetPassword(req: Request, res: Response) {
  const { email, code, password } = resetPasswordSchema.parse(req.body);
  const record = await findUsableCode(email, "password_reset");
  if (!record || !(await bcrypt.compare(code, record.codeHash))) {
    if (record) await prisma.passwordResetCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return sendError(res, "Invalid or expired reset code", 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { email }, data: { password: passwordHash, status: "active" } });
  await prisma.passwordResetCode.update({ where: { id: record.id }, data: { consumed: true } });
  await prisma.refreshToken.deleteMany({ where: { userId: record.userId ?? undefined } });
  await prisma.activeSession.deleteMany({ where: { userId: record.userId ?? undefined } });
  await audit(record.userId ?? undefined, undefined, "auth.password_reset_completed", "auth", "HIGH", req, { email });
  return sendSuccess(res, null, "Password reset complete");
}

export async function verifyOtp(req: Request, res: Response) {
  const { email, code } = verifyEmailSchema.parse(req.body);
  const record = await findUsableCode(email, "email_verification");
  if (!record || !(await bcrypt.compare(code, record.codeHash))) {
    if (record) await prisma.passwordResetCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return sendError(res, "Invalid or expired verification code", 400);
  }
  const user = await prisma.user.update({ where: { email }, data: { emailVerified: true } });
  await prisma.passwordResetCode.update({ where: { id: record.id }, data: { consumed: true } });
  await audit(user.id, user.role, "auth.email_verified", "auth", "INFO", req, { email });
  return sendSuccess(res, { verified: true }, "Email verified");
}

export async function resendOtp(req: Request, res: Response) {
  const { email } = forgotPasswordSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  const code = createOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  if (user) {
    await prisma.passwordResetCode.create({
      data: {
        email,
        userId: user.id,
        purpose: "email_verification",
        codeHash: await bcrypt.hash(code, 12),
        expiresAt
      }
    });
  }
  return sendSuccess(res, { expiresAt, ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}) }, "Verification code sent");
}

export function ssoStart(req: Request, res: Response) {
  const { provider, redirectUri } = ssoStartSchema.parse(req.body);
  const state = randomBytes(16).toString("hex");
  const authorizationUrl =
    provider === "mock"
      ? `${redirectUri ?? "http://localhost:3000/login"}?sso_provider=mock&code=mock-${state}`
      : `https://sso.${provider}.example/authorize?state=${state}`;
  return sendSuccess(res, { provider, state, authorizationUrl }, "SSO authorization prepared");
}

export async function ssoCallback(req: Request, res: Response) {
  await ensureDefaultRbac();
  const { provider, code } = ssoCallbackSchema.parse(req.body);
  if (!code.startsWith("mock-")) return sendError(res, "Only mock SSO exchange is enabled in this environment", 400);
  const role = await prisma.role.findUnique({ where: { slug: "admin" } });
  if (!role) return sendError(res, "Admin role is not configured", 500);
  const email = `agency.${code.slice(-8)}@sso.local`;
  const user = await prisma.user.upsert({
    where: { email },
    update: { status: "active", emailVerified: true },
    create: {
      name: "Agency SSO Operator",
      email,
      phone: `SSO${Date.now()}`,
      password: await bcrypt.hash(randomBytes(24).toString("hex"), 12),
      role: role.slug,
      primaryRoleId: role.id,
      emailVerified: true,
      roles: { create: { roleId: role.id, country: "India" } }
    }
  });
  const access = await resolveUserAccess(user.id);
  const authUser = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  await persistRefreshToken(refreshToken, user.id, req);
  await audit(user.id, user.role, "auth.sso_login", "auth", "INFO", req, { provider });
  return sendSuccess(res, { user: publicUser(user), access, redirectTo: dashboardForAccess(access), accessToken, refreshToken }, "SSO login complete");
}

export async function assignUserRole(req: Request, res: Response) {
  const { userId, roleSlug, district, state, country } = req.body as {
    userId?: string;
    roleSlug?: string;
    district?: string;
    state?: string;
    country?: string;
  };
  if (!userId || !roleSlug) return sendError(res, "userId and roleSlug are required", 400);
  await assignRole(userId, roleSlug, req.user?.id, { district, state, country });
  return sendSuccess(res, null, "Role assigned");
}

async function persistRefreshToken(token: string, userId: string, req: Request) {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 86400000);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  await prisma.activeSession.upsert({
    where: { refreshToken: token },
    update: { lastSeenAt: new Date(), ip: req.ip, device: req.headers["user-agent"] },
    create: { refreshToken: token, userId, expiresAt, ip: req.ip, device: req.headers["user-agent"] }
  });
}

function createOtp() {
  return String(randomInt(100000, 1000000));
}

async function findUsableCode(email: string, purpose: string) {
  return prisma.passwordResetCode.findFirst({
    where: {
      email,
      purpose,
      consumed: false,
      attempts: { lt: 5 },
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: "desc" }
  });
}

async function audit(
  userId: string | undefined,
  role: string | undefined,
  action: string,
  module: string,
  severity: string,
  req: Request,
  metadata: object
) {
  await prisma.auditLog.create({
    data: {
      userId,
      role,
      action,
      module,
      severity,
      ip: req.ip,
      device: req.headers["user-agent"],
      metadata
    }
  });
}
