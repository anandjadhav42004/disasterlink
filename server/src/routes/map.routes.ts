import { Router } from "express";
import { Role } from "@prisma/client";
import { heatmap, liveMap, mapShelters, getHeatmap, getLive, getShelters } from "../controllers/map.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const mapRoutes = Router();

mapRoutes.get("/shelters", mapShelters);
mapRoutes.get("/live", requireAuth, liveMap);
mapRoutes.get("/heatmap", requireAuth, requireRole(Role.ADMIN, Role.VOLUNTEER), heatmap);

export default mapRoutes;
export { mapRoutes };
