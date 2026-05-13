import { Router } from "express";
import { Role } from "@prisma/client";
import { analytics, broadcast, heatmap, incidents, volunteers } from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(Role.ADMIN));
adminRouter.get("/analytics", analytics);
adminRouter.get("/incidents", incidents);
adminRouter.get("/volunteers", volunteers);
adminRouter.post("/broadcast", broadcast);
adminRouter.get("/heatmap", heatmap);
