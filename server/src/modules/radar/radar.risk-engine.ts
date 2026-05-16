import type { OperationalRiskInput, OperationalRiskScore, RadarRiskLevel, RainIntensity } from "./radar.types.js";

export function riskLevel(score: number): RadarRiskLevel {
  if (score >= 82) return "CRITICAL";
  if (score >= 62) return "SEVERE";
  if (score >= 34) return "MODERATE";
  return "SAFE";
}

export function severityFromRain(intensity: number): RadarRiskLevel {
  if (intensity >= 82) return "CRITICAL";
  if (intensity >= 62) return "SEVERE";
  if (intensity >= 35) return "MODERATE";
  return "SAFE";
}

export function calculateOperationalRisk(input: OperationalRiskInput): OperationalRiskScore {
  const volunteerPressure = Math.max(0, 100 - input.volunteerAvailability);
  const weightedScore =
    input.rainIntensity * 0.22 +
    input.windSpeed * 0.12 +
    input.floodProbability * 0.2 +
    input.sosDensity * 0.17 +
    input.shelterOccupancy * 0.12 +
    volunteerPressure * 0.07 +
    input.incidentSeverity * 0.1;

  const score = Math.min(100, Math.round(weightedScore));
  const level = riskLevel(score);
  const recommendations = [
    ...(input.rainIntensity >= 65 ? ["Stage high-water rescue teams near low-lying wards."] : []),
    ...(input.floodProbability >= 70 ? ["Activate evacuation-ready shelter routing."] : []),
    ...(input.sosDensity >= 60 ? ["Escalate repeated SOS clusters to district command."] : []),
    ...(input.shelterOccupancy >= 80 ? ["Open overflow shelter capacity and reroute arrivals."] : []),
    ...(input.volunteerAvailability <= 35 ? ["Request cross-district volunteer reinforcement."] : []),
    ...(level === "SAFE" ? ["Maintain monitoring posture and keep responders available."] : [])
  ];

  return { ...input, score, level, recommendations, calculatedAt: new Date().toISOString() };
}

export function estimateRainIntensity(params: {
  rainfallProbability: number;
  windSpeed: number;
  humidity: number;
  condition: string;
  frameAgeMinutes: number;
}): Pick<RainIntensity, "intensity" | "rainfallMmHr" | "severity"> {
  const conditionBoost = /(heavy|rain|storm|thunder|cyclone|monsoon|shower|flood)/i.test(params.condition) ? 22 : 0;
  const freshnessBoost = params.frameAgeMinutes <= 20 ? 8 : params.frameAgeMinutes <= 45 ? 4 : 0;
  const intensity = Math.min(
    100,
    Math.round(params.rainfallProbability * 0.58 + params.windSpeed * 0.4 + params.humidity * 0.08 + conditionBoost + freshnessBoost)
  );
  const rainfallMmHr = Number((intensity * 0.42).toFixed(1));
  return { intensity, rainfallMmHr, severity: severityFromRain(intensity) };
}
