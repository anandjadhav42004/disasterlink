import { Router } from "express";
import {
  bulkSuspend,
  createUser,
  deactivateAccount,
  deleteUser,
  listUsers,
  triggerPasswordReset,
  updateProfile,
  updateUser
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/role.middleware.js";

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.patch("/profile", updateProfile);
userRouter.post("/deactivate", deactivateAccount);
userRouter.get("/", requirePermission("users.view", "users.manage"), listUsers);
userRouter.post("/", requirePermission("users.manage"), createUser);
userRouter.patch("/bulk/suspend", requirePermission("users.manage"), bulkSuspend);
userRouter.patch("/:id", requirePermission("users.manage"), updateUser);
userRouter.post("/:id/reset-password", requirePermission("users.manage"), triggerPasswordReset);
userRouter.delete("/:id", requirePermission("users.manage"), deleteUser);
