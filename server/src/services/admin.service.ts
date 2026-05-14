import type { Severity, SOSStatus } from "@prisma/client";
import { prisma } from "../config/database.js";
import { emitToAll } from "../sockets/index.js";

export async function getAnalytics() {
  const [
    totalSOS,
    resolvedSOS,
    pendingSOS,
    assignedSOS,
    activeVolunteers,
    totalVolunteers,
    totalShelters,
    totalUsers,
    sosByType,
    sosByStatus,
  ] = await Promise.all([
    prisma.sOSRequest.count(),
    prisma.sOSRequest.count({ where: { status: "RESOLVED" } }),
    prisma.sOSRequest.count({ where: { status: "PENDING" } }),
    prisma.sOSRequest.count({ where: { status: "ASSIGNED" } }),
    prisma.volunteer.count({ where: { isAvailable: true } }),
    prisma.volunteer.count(),
    prisma.shelter.count(),
    prisma.user.count(),
    prisma.sOSRequest.groupBy({
      by: ["type"],
      _count: { type: true },
    }),
    prisma.sOSRequest.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  return {
    totalSOS,
    resolvedSOS,
    pendingSOS,
    assignedSOS,
    activeVolunteers,
    totalVolunteers,
    totalShelters,
    totalUsers,
    sosByType,
    sosByStatus,
  };
}

export async function getIncidents(filters: {
  status?: SOSStatus;
  severity?: Severity;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.min(Math.max(filters.limit ?? 20, 1), 100);
  const where = {
    status: filters.status,
    severity: filters.severity,
  };

  const [data, total] = await Promise.all([
    prisma.sOSRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        volunteer: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sOSRequest.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function broadcastAlert(data: {
  title: string;
  message: string;
  severity: Severity;
}) {
  const alert = await prisma.alert.create({ data });
  emitToAll("emergency-alert", {
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    createdAt: alert.createdAt,
  });

  return alert;
}

export async function getVolunteers() {
  return prisma.volunteer.findMany({
    include: {
      user: true,
      assignedRequests: true,
    },
  });
}

export async function getHeatmap() {
  return prisma.sOSRequest.findMany({
    select: {
      latitude: true,
      longitude: true,
      severity: true,
      status: true,
    },
    where: {
      status: { not: "CANCELLED" },
    },
    take: 500,
  });
}
