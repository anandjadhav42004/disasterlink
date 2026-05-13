import { SOSStatus } from "@prisma/client";
import { prisma } from "../config/database.js";
import { NEARBY_VOLUNTEER_LIMIT } from "../constants/index.js";
import { distanceKm } from "./distance.service.js";

export async function findNearestAvailableVolunteers(latitude: number, longitude: number, limit = NEARBY_VOLUNTEER_LIMIT) {
  const volunteers = await prisma.volunteer.findMany({
    where: {
      isAvailable: true,
      user: { latitude: { not: null }, longitude: { not: null } }
    },
    include: { user: true }
  });

  return volunteers
    .map((volunteer) => ({
      ...volunteer,
      distanceKm: distanceKm(
        { latitude, longitude },
        { latitude: volunteer.user.latitude ?? 0, longitude: volunteer.user.longitude ?? 0 }
      )
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export async function acceptSosTask(sosId: string, userId: string) {
  const volunteer = await prisma.volunteer.findUnique({ where: { userId } });
  if (!volunteer) {
    throw new Error("Volunteer profile not found");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.sOSRequest.findUnique({ where: { id: sosId } });
    if (!existing || existing.status !== SOSStatus.PENDING) {
      throw new Error("SOS request is no longer available");
    }

    return tx.sOSRequest.update({
      where: { id: sosId },
      data: { volunteerId: volunteer.id, status: SOSStatus.ASSIGNED },
      include: { user: true, volunteer: { include: { user: true } } }
    });
  });
}
