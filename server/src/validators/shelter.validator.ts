import { z } from "zod";

export const nearbyShelterSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(200).default(25)
});

export const createShelterSchema = z.object({
  name: z.string().min(2),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  capacity: z.coerce.number().int().positive(),
  occupied: z.coerce.number().int().min(0).default(0),
  address: z.string().optional(),
  contact: z.string().optional()
});

export const occupancySchema = z.object({
  occupied: z.coerce.number().int().min(0)
});
