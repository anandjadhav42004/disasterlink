import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resendOtp,
  resetPassword,
  ssoCallback,
  ssoStart,
  updateFcmToken,
  verifyOtp,
  verifyResetCode
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/resend-otp", resendOtp);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-reset-code", verifyResetCode);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/sso/start", ssoStart);
authRouter.post("/sso/callback", ssoCallback);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
authRouter.patch("/fcm-token", requireAuth, updateFcmToken);
