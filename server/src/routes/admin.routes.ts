import { Router } from "express";
import {
  analytics,
  auditLogs,
  broadcast,
  createIncident,
  declareEmergency,
  heatmap,
  incidents,
  updateIncident,
  volunteers
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/role.middleware.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.get("/analytics", requirePermission("analytics.view", "analytics.national"), analytics);
adminRouter.get("/incidents", requirePermission("incidents.view", "incidents.manage"), incidents);
adminRouter.post("/incidents", requirePermission("incidents.manage", "emergency.override"), createIncident);
adminRouter.patch("/incidents/:id", requirePermission("incidents.manage", "emergency.override"), updateIncident);
adminRouter.get("/volunteers", requirePermission("volunteers.view", "volunteers.manage"), volunteers);
adminRouter.post("/declare-emergency", requirePermission("emergency.override", "alerts.broadcast"), declareEmergency);
adminRouter.post("/broadcast", requirePermission("alerts.broadcast", "emergency.override"), broadcast);
adminRouter.get("/audit", requirePermission("audit.view", "users.manage"), auditLogs);
adminRouter.get("/heatmap", requirePermission("map.full_access", "analytics.view"), heatmap);
