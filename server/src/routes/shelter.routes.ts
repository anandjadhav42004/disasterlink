import { Router } from "express";
import { createShelter, deleteShelter, getShelter, listShelters, nearbyShelters, updateOccupancy, updateShelter } from "../controllers/shelter.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requirePermission } from "../middleware/role.middleware.js";

export const shelterRouter = Router();

shelterRouter.get("/nearby", nearbyShelters);
shelterRouter.get("/", listShelters);
shelterRouter.get("/:id", getShelter);
shelterRouter.post("/", requireAuth, requirePermission("shelters.create", "shelters.manage"), createShelter);
shelterRouter.patch("/:id", requireAuth, requirePermission("shelters.manage"), updateShelter);
shelterRouter.patch("/:id/occupancy", requireAuth, requirePermission("shelters.manage"), updateOccupancy);
shelterRouter.delete("/:id", requireAuth, requirePermission("shelters.manage"), deleteShelter);
