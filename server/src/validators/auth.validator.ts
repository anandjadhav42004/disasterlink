import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string().min(2).default("citizen"),
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export const fcmTokenSchema = z.object({
  fcmToken: z.string().min(10)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const verifyResetCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/)
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
  password: z.string().min(8)
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/)
});

export const ssoStartSchema = z.object({
  provider: z.enum(["mock", "google", "microsoft", "government"]).default("mock"),
  redirectUri: z.string().url().optional()
});

export const ssoCallbackSchema = z.object({
  provider: z.enum(["mock", "google", "microsoft", "government"]).default("mock"),
  code: z.string().min(4),
  redirectUri: z.string().url().optional()
});
