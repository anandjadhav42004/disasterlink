import { Router } from "express";
import { Role } from "@prisma/client";
import { createShelter, getShelter, nearbyShelters, updateOccupancy } from "../controllers/shelter.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

export const shelterRouter = Router();

shelterRouter.get("/nearby", nearbyShelters);
shelterRouter.get("/:id", getShelter);
shelterRouter.post("/", requireAuth, requireRole(Role.ADMIN), createShelter);
shelterRouter.patch("/:id/occupancy", requireAuth, requireRole(Role.ADMIN), updateOccupancy);
