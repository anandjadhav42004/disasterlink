import { SOSStatus } from "@prisma/client";
import { prisma } from "../config/database.js";
import { calculateSeverity } from "../utils/severityScore.js";
import { findNearestAvailableVolunteers } from "./volunteer.service.js";
import { notifyVolunteers } from "./notification.service.js";
import { distanceKm } from "./distance.service.js";

interface CreateSosInput {
  userId: string;
  type: Parameters<typeof calculateSeverity>[0];
  description?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export async function createSos(input: CreateSosInput) {
  const openRequests = await prisma.sOSRequest.findMany({
    where: { status: { in: [SOSStatus.PENDING, SOSStatus.ASSIGNED, SOSStatus.IN_PROGRESS] } },
    select: { latitude: true, longitude: true }
  });
  const openNearbyCount = openRequests.filter((request) =>
    distanceKm(input, request) <= 5
  ).length;

  const sos = await prisma.sOSRequest.create({
    data: {
      userId: input.userId,
      type: input.type,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      imageUrl: input.imageUrl,
      severity: calculateSeverity(input.type, openNearbyCount)
    },
    include: { user: true, volunteer: { include: { user: true } } }
  });

  const volunteers = await findNearestAvailableVolunteers(input.latitude, input.longitude);
  await notifyVolunteers(sos, volunteers);

  return { sos, volunteers };
}
