import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../config/database.js";
import { jwtConfig } from "../config/jwt.js";
import { fcmTokenSchema, loginSchema, refreshSchema, registerSchema } from "../validators/auth.validator.js";
import { sendSuccess, sendError } from "../utils/response.js";
import type { AuthUser } from "../types/index.js";

function signAccessToken(user: AuthUser) {
  return jwt.sign(user, jwtConfig.accessSecret, { expiresIn: jwtConfig.accessExpiresIn } as SignOptions);
}

function signRefreshToken(user: AuthUser) {
  return jwt.sign(user, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn } as SignOptions);
}

function publicUser(user: { id: string; name: string; phone: string; email: string; role: Role; latitude: number | null; longitude: number | null }) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    latitude: user.latitude,
    longitude: user.longitude
  };
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const password = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      ...input,
      password,
      volunteerProfile: input.role === Role.VOLUNTEER ? { create: {} } : undefined
    }
  });
  const authUser = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  await persistRefreshToken(refreshToken, user.id);
  return sendSuccess(res, { user: publicUser(user), accessToken, refreshToken }, "Registered", 201);
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    return sendError(res, "Invalid credentials", 401);
  }
  const authUser = { id: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  await persistRefreshToken(refreshToken, user.id);
  return sendSuccess(res, { user: publicUser(user), accessToken, refreshToken }, "Logged in");
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) return sendError(res, "Invalid refresh token", 401);
  const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as AuthUser;
  const accessToken = signAccessToken(decoded);
  return sendSuccess(res, { accessToken }, "Token refreshed");
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  return sendSuccess(res, null, "Logged out");
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
  if (!user) return sendError(res, "User not found", 404);
  return sendSuccess(res, publicUser(user), "Profile loaded");
}

export async function updateFcmToken(req: Request, res: Response) {
  const { fcmToken } = fcmTokenSchema.parse(req.body);
  await prisma.user.update({ where: { id: req.user?.id }, data: { fcmToken } });
  return sendSuccess(res, null, "FCM token updated");
}

export function verifyOtp(_req: Request, res: Response) {
  return sendSuccess(res, { verified: true }, "OTP verification stub accepted");
}

async function persistRefreshToken(token: string, userId: string) {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 86400000);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
}
