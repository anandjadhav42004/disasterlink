import type { SOSType } from "@prisma/client";
import { calculateSeverity } from "../utils/severityScore.js";

export function scorePriority(type: SOSType, openNearbyCount: number) {
  return calculateSeverity(type, openNearbyCount);
}
