import { Severity, SOSType } from "@prisma/client";

export function calculateSeverity(type: SOSType, openNearbyCount = 0, createdAt = new Date()) {
  let score = 1;

  if (type === "TRAPPED") score += 4;
  if (type === "MEDICAL" || type === "FIRE") score += 3;
  if (type === "EARTHQUAKE" || type === "FLOOD") score += 2;
  if (openNearbyCount >= 5) score += 2;
  if ((Date.now() - createdAt.getTime()) / 60000 > 30) score += 2;

  if (score >= 6) return Severity.CRITICAL;
  if (score >= 4) return Severity.HIGH;
  if (score >= 2) return Severity.MEDIUM;
  return Severity.LOW;
}
