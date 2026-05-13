import { SOSStatus, SOSType } from "@prisma/client";
import { z } from "zod";

export const createSosSchema = z.object({
  type: z.nativeEnum(SOSType),
  description: z.string().max(1000).optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180)
});

export const nearbySosSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(100).default(10)
});

export const updateSosStatusSchema = z.object({
  status: z.nativeEnum(SOSStatus)
});
