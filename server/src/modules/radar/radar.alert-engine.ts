import { Severity, SOSStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import type { FloodRiskZonePayload, OperationalRiskScore, RadarAlertPayload } from "./radar.types.js";
import { emitRainfallAlert } from "./radar.socket.js";

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function toPrismaSeverity(severity: RadarAlertPayload["severity"]) {
  if (severity === "CRITICAL") return Severity.CRITICAL;
  if (severity === "SEVERE") return Severity.HIGH;
  if (severity === "MODERATE") return Severity.MEDIUM;
  return Severity.LOW;
}

export function buildFloodRiskAlert(zone: FloodRiskZonePayload, risk: OperationalRiskScore): RadarAlertPayload | null {
  if (zone.severity !== "CRITICAL" && zone.severity !== "SEVERE") return null;

  return {
    title: `${zone.severity} flood risk: ${zone.district}`,
    message: `${zone.district} is showing ${zone.probability}% flood probability with operational risk score ${risk.score}.`,
    district: zone.district,
    state: zone.state,
    severity: zone.severity,
    type: "FLOOD",
    coordinates: zone.coordinates,
    triggers: zone.triggers,
    recommendedActions: zone.recommendedActions,
    createdAt: new Date().toISOString()
  };
}

export async function activateFloodAutomation(zone: FloodRiskZonePayload, risk: OperationalRiskScore) {
  const alert = buildFloodRiskAlert(zone, risk);
  if (!alert || process.env.FLOOD_RISK_ENGINE === "false") return null;

  const recent = await prisma.alert.findFirst({
    where: {
      district: { equals: zone.district, mode: "insensitive" },
      status: "active",
      metadata: { path: ["source"], equals: "radar-flood-risk" },
      createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) }
    }
  });
  if (recent) return null;

  await prisma.alert.create({
    data: {
      title: alert.title,
      message: alert.message,
      severity: toPrismaSeverity(alert.severity),
      latitude: alert.coordinates.lat,
      longitude: alert.coordinates.lng,
      radius: 35,
      district: alert.district,
      state: alert.state,
      channels: ["app", "socket", "admin", "volunteer"],
      metadata: toJson({
        source: "radar-flood-risk",
        triggers: alert.triggers,
        recommendedActions: alert.recommendedActions,
        riskScore: risk.score
      })
    }
  });

  await prisma.sOSRequest.updateMany({
    where: {
      status: { in: [SOSStatus.PENDING, SOSStatus.ASSIGNED, SOSStatus.IN_PROGRESS] },
      OR: [
        { user: { district: { equals: zone.district, mode: "insensitive" } } },
        {
          latitude: { gte: zone.coordinates.lat - 0.45, lte: zone.coordinates.lat + 0.45 },
          longitude: { gte: zone.coordinates.lng - 0.45, lte: zone.coordinates.lng + 0.45 }
        }
      ]
    },
    data: { severity: Severity.CRITICAL }
  });

  emitRainfallAlert(alert);
  return alert;
}
