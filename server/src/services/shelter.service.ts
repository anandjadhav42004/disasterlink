import { prisma } from "../config/database.js";
import { distanceKm } from "./distance.service.js";

export async function findNearbyShelters(latitude: number, longitude: number, radiusKm: number) {
  const shelters = await prisma.shelter.findMany();
  return shelters
    .map((shelter) => ({
      ...shelter,
      distanceKm: distanceKm({ latitude, longitude }, shelter)
    }))
    .filter((shelter) => shelter.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
