import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["citizen", "volunteer"]),
    agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const sosSchema = z.object({
  type: z.enum(["medical", "rescue", "evacuation", "supplies", "shelter", "other"]),
  description: z.string().min(10, "Please provide more details (min 10 chars)"),
  peopleAffected: z.number().min(1, "At least 1 person must be affected"),
  address: z.string().min(5, "Please provide a valid address"),
});

export const incidentSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum([
    "earthquake", "flood", "fire", "hurricane", "tornado",
    "tsunami", "landslide", "chemical", "biological", "other",
  ]),
  severity: z.enum(["critical", "high", "medium", "low"]),
  address: z.string().min(5, "Please provide a valid address"),
  affectedPopulation: z.number().min(0),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  urgency: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export const alertSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  severity: z.enum(["critical", "warning", "info", "all-clear"]),
  affectedAreas: z.array(z.string()).min(1, "Select at least one area"),
  expiresAt: z.string().min(1, "Expiration date is required"),
  broadcastChannels: z.array(z.string()).min(1, "Select at least one channel"),
});

export const verifyOTPSchema = z.object({
  code: z.string().length(6, "OTP must be exactly 6 digits"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type SOSFormData = z.infer<typeof sosSchema>;
export type IncidentFormData = z.infer<typeof incidentSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type AlertFormData = z.infer<typeof alertSchema>;
export type VerifyOTPFormData = z.infer<typeof verifyOTPSchema>;
