import type { DisasterWeather, WeatherAlertPayload, WeatherSeverity } from "./weather.types.js";

const severityRank: Record<WeatherSeverity, number> = {
  SAFE: 0,
  MODERATE: 1,
  SEVERE: 2,
  CRITICAL: 3
};

function maxSeverity(current: WeatherSeverity, candidate: WeatherSeverity) {
  return severityRank[candidate] > severityRank[current] ? candidate : current;
}

export function analyzeWeatherRisk(weather: Omit<DisasterWeather, "severity" | "risks" | "recommendedActions">) {
  let severity: WeatherSeverity = "SAFE";
  const risks: string[] = [];
  const recommendedActions: string[] = [];
  const condition = weather.condition.toLowerCase();

  if (weather.rainfallProbability >= 85) {
    severity = maxSeverity(severity, "CRITICAL");
    risks.push("extreme-rainfall");
    recommendedActions.push("Activate flood response staging and review low-lying evacuation routes.");
  } else if (weather.rainfallProbability >= 65) {
    severity = maxSeverity(severity, "SEVERE");
    risks.push("heavy-rainfall");
    recommendedActions.push("Pre-position drainage, shelter, and field response teams.");
  } else if (weather.rainfallProbability >= 40) {
    severity = maxSeverity(severity, "MODERATE");
    risks.push("rainfall-watch");
  }

  if (weather.windSpeed >= 90) {
    severity = maxSeverity(severity, "CRITICAL");
    risks.push("destructive-wind");
    recommendedActions.push("Suspend exposed field operations and alert coastal command posts.");
  } else if (weather.windSpeed >= 62) {
    severity = maxSeverity(severity, "SEVERE");
    risks.push("dangerous-wind");
    recommendedActions.push("Warn volunteers about falling debris and unsafe routes.");
  } else if (weather.windSpeed >= 35) {
    severity = maxSeverity(severity, "MODERATE");
    risks.push("wind-advisory");
  }

  if (weather.temperature >= 45 || weather.feelsLike >= 48) {
    severity = maxSeverity(severity, "CRITICAL");
    risks.push("extreme-heatwave");
    recommendedActions.push("Open cooling shelters and prioritize elderly, medical, and outdoor SOS calls.");
  } else if (weather.temperature >= 40 || weather.feelsLike >= 43) {
    severity = maxSeverity(severity, "SEVERE");
    risks.push("heatwave");
    recommendedActions.push("Issue hydration guidance and rotate volunteer shifts.");
  }

  if (weather.visibility <= 1) {
    severity = maxSeverity(severity, "CRITICAL");
    risks.push("near-zero-visibility");
    recommendedActions.push("Restrict non-essential vehicle movement and reroute active deployments.");
  } else if (weather.visibility <= 3) {
    severity = maxSeverity(severity, "SEVERE");
    risks.push("low-visibility");
  }

  if (/(cyclone|hurricane|typhoon)/i.test(condition)) {
    severity = maxSeverity(severity, "CRITICAL");
    risks.push("cyclone-risk");
    recommendedActions.push("Trigger cyclone readiness protocol and coastal evacuation review.");
  } else if (/(storm|thunder|squall|tornado)/i.test(condition)) {
    severity = maxSeverity(severity, "SEVERE");
    risks.push("storm-risk");
    recommendedActions.push("Notify admins and volunteers about lightning, debris, and route hazards.");
  }

  if (weather.uvIndex >= 10) {
    severity = maxSeverity(severity, "MODERATE");
    risks.push("high-uv");
  }

  if (risks.length === 0) risks.push("normal-operations");
  if (recommendedActions.length === 0) recommendedActions.push("Continue routine monitoring.");

  return { severity, risks: Array.from(new Set(risks)), recommendedActions: Array.from(new Set(recommendedActions)) };
}

export function buildWeatherAlert(weather: DisasterWeather): WeatherAlertPayload | null {
  if (weather.severity === "SAFE" || weather.severity === "MODERATE") return null;

  const firstRisk = weather.risks[0] ?? "weather-risk";
  const type = firstRisk.includes("rain")
    ? "RAINFALL"
    : firstRisk.includes("heat")
      ? "HEATWAVE"
      : firstRisk.includes("cyclone")
        ? "CYCLONE"
        : firstRisk.includes("storm")
          ? "STORM"
          : firstRisk.includes("visibility")
            ? "VISIBILITY"
            : firstRisk.includes("wind")
              ? "WIND"
              : "GENERAL";

  const titleByType: Record<WeatherAlertPayload["type"], string> = {
    RAINFALL: `Severe rainfall detected in ${weather.district}.`,
    HEATWAVE: `Extreme heatwave alert for ${weather.district}.`,
    CYCLONE: `Cyclone-risk conditions detected near ${weather.district}.`,
    STORM: `Storm-risk conditions detected in ${weather.district}.`,
    VISIBILITY: `Low visibility warning for ${weather.district}.`,
    WIND: `Dangerous wind conditions in ${weather.district}.`,
    GENERAL: `Severe weather detected in ${weather.district}.`
  };

  return {
    title: titleByType[type],
    message: `${weather.condition} with ${weather.temperature}C, ${weather.windSpeed} km/h wind, ${weather.humidity}% humidity, and ${weather.rainfallProbability}% rainfall risk.`,
    city: weather.city,
    district: weather.district,
    country: weather.country,
    severity: weather.severity,
    type,
    coordinates: weather.coordinates,
    risks: weather.risks,
    recommendedActions: weather.recommendedActions,
    weather,
    createdAt: new Date().toISOString()
  };
}
