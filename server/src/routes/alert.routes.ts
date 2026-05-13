import { Router } from "express";
import { Role } from "@prisma/client";
import { createAlert, deleteAlert, listAlerts } from "../controllers/alert.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

export const alertRouter = Router();

alertRouter.get("/", listAlerts);
alertRouter.post("/", requireAuth, requireRole(Role.ADMIN), createAlert);
alertRouter.delete("/:id", requireAuth, requireRole(Role.ADMIN), deleteAlert);
