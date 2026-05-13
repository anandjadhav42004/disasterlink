export function summarizeRisk(openIncidents: number, criticalIncidents: number) {
  if (criticalIncidents > 5) return "CRITICAL";
  if (openIncidents > 15) return "HIGH";
  if (openIncidents > 5) return "MEDIUM";
  return "LOW";
}
