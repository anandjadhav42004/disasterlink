import axios, { type AxiosInstance } from "axios";
import { Severity, SOSStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { logger } from "../../utils/logger.js";
import { weatherService } from "../weather/weather.service.js";
import { activateFloodAutomation } from "./radar.alert-engine.js";
import { calculateOperationalRisk, estimateRainIntensity, riskLevel, severityFromRain } from "./radar.risk-engine.js";
import type {
  Coordinates,
  DistrictRadarPayload,
  FloodRiskZonePayload,
  OperationalRiskInput,
  OperationalRiskScore,
  RadarOverlay,
  RadarOverlayMarker,
  RadarTilesPayload,
  RainIntensity,
  RainViewerFrame,
  RainViewerMapResponse,
  StormTrack
} from "./radar.types.js";

const DEFAULT_DISTRICTS = [
  { district: "Mumbai", state: "Maharashtra", coordinates: { lat: 19.076, lng: 72.8777 }, coastal: true, riverine: true },
  { district: "Delhi", state: "Delhi", coordinates: { lat: 28.6139, lng: 77.209 }, coastal: false, riverine: true },
  { district: "Ahmedabad", state: "Gujarat", coordinates: { lat: 23.0225, lng: 72.5714 }, coastal: false, riverine: true },
  { district: "Chennai", state: "Tamil Nadu", coordinates: { lat: 13.0827, lng: 80.2707 }, coastal: true, riverine: false },
  { district: "Kolkata", state: "West Bengal", coordinates: { lat: 22.5726, lng: 88.3639 }, coastal: true, riverine: true },
  { district: "Guwahati", state: "Assam", coordinates: { lat: 26.1445, lng: 91.7362 }, coastal: false, riverine: true },
  { district: "Bhubaneswar", state: "Odisha", coordinates: { lat: 20.2961, lng: 85.8245 }, coastal: true, riverine: true },
  { district: "Kochi", state: "Kerala", coordinates: { lat: 9.9312, lng: 76.2673 }, coastal: true, riverine: true },
  { district: "Patna", state: "Bihar", coordinates: { lat: 25.5941, lng: 85.1376 }, coastal: false, riverine: true },
  { district: "Srinagar", state: "Jammu and Kashmir", coordinates: { lat: 34.0837, lng: 74.7973 }, coastal: false, riverine: true }
];

const cache = new Map<string, { expiresAt: number; value: unknown }>();

function getCache<T>(key: string) {
  const cached = cache.get(key);
  if (!cached || cached.expiresAt < Date.now()) return null;
  return cached.value as T;
}

function setCache(key: string, value: unknown, seconds = Number(process.env.RADAR_REFRESH_INTERVAL ?? 120)) {
  cache.set(key, { value, expiresAt: Date.now() + seconds * 1000 });
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalizeDistrictName(district: string) {
  return district.trim().toLowerCase();
}

function districtProfile(district: string) {
  const normalized = normalizeDistrictName(district);
  return DEFAULT_DISTRICTS.find((item) => normalizeDistrictName(item.district) === normalized) ?? {
    district,
    state: "India",
    coordinates: { lat: 22.9734, lng: 78.6569 },
    coastal: false,
    riverine: false
  };
}

function frameAgeMinutes(frame: RainViewerFrame | null) {
  if (!frame) return 120;
  return Math.max(0, Math.round((Date.now() - frame.time * 1000) / 60_000));
}

function buildFrame(host: string, frame: { time: number; path: string }): RainViewerFrame {
  const generatedAt = new Date(frame.time * 1000).toISOString();
  return {
    time: frame.time,
    path: frame.path,
    tileUrl: `${host}${frame.path}/512/{z}/{x}/{y}/2/1_1.png`,
    coverageUrl: `${host}/v2/coverage/0/512/{z}/{x}/{y}/0/0_0.png`,
    generatedAt
  };
}

function marker(id: string, district: string, coordinates: Coordinates, severity: RadarOverlayMarker["severity"], value: number, label: string, type: string): RadarOverlayMarker {
  return { id, district, coordinates, severity, value, label, type };
}

function mapSeverityToScore(severity: Severity | string) {
  if (severity === Severity.CRITICAL || severity === "CRITICAL") return 100;
  if (severity === Severity.HIGH || severity === "HIGH") return 78;
  if (severity === Severity.MEDIUM || severity === "MEDIUM") return 48;
  return 22;
}

class RadarService {
  private client: AxiosInstance;
  private latestTiles: RadarTilesPayload | null = null;
  private latestStorms: StormTrack[] = [];
  private latestFloodZones: FloodRiskZonePayload[] = [];
  private latestDistrictRisks: OperationalRiskScore[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: process.env.RAINVIEWER_BASE_URL ?? "https://api.rainviewer.com",
      timeout: Number(process.env.RAINVIEWER_TIMEOUT_MS ?? 8000)
    });
  }

  async getRadarTiles(): Promise<RadarTilesPayload> {
    const cached = process.env.RADAR_TILE_CACHE !== "false" ? getCache<RadarTilesPayload>("radar:tiles") : null;
    if (cached) return cached;

    if (process.env.RAINVIEWER_ENABLED === "false") {
      return this.fallbackTiles();
    }

    try {
      const response = await this.client.get<RainViewerMapResponse>("/public/weather-maps.json");
      const data = response.data;
      const host = data.host ?? "https://tilecache.rainviewer.com";
      const past = (data.radar?.past ?? []).map((frame) => buildFrame(host, frame));
      const forecast = (data.radar?.nowcast ?? []).map((frame) => buildFrame(host, frame));
      const payload: RadarTilesPayload = {
        provider: "rainviewer",
        version: data.version ?? "2.0",
        generatedAt: data.generated ? new Date(data.generated * 1000).toISOString() : new Date().toISOString(),
        host,
        tileTemplate: `${host}{path}/512/{z}/{x}/{y}/2/1_1.png`,
        coverageTemplate: `${host}/v2/coverage/0/512/{z}/{x}/{y}/0/0_0.png`,
        past,
        forecast,
        attribution: "RainViewer"
      };

      this.latestTiles = payload;
      setCache("radar:tiles", payload);
      await this.persistRadarSnapshot(payload);
      return payload;
    } catch (error) {
      logger.warn("RainViewer radar request failed; serving cached or fallback radar", {
        error: error instanceof Error ? error.message : String(error)
      });
      return this.latestTiles ?? this.fallbackTiles();
    }
  }

  async getLatestRadarFrame() {
    const tiles = await this.getRadarTiles();
    return tiles.past.at(-1) ?? null;
  }

  async getForecastRadar() {
    const tiles = await this.getRadarTiles();
    return {
      generatedAt: tiles.generatedAt,
      frames: tiles.forecast.length > 0 ? tiles.forecast : tiles.past.slice(-3),
      provider: "rainviewer",
      note: tiles.forecast.length > 0 ? "RainViewer nowcast frames" : "RainViewer public endpoint currently exposes recent radar frames; using latest past frames for playback continuity."
    };
  }

  async getRadarOverlay(): Promise<RadarOverlay> {
    const [tiles, storms, floodRisk, risks] = await Promise.all([
      this.getRadarTiles(),
      this.getStormTracking(),
      this.getFloodRisk(),
      this.getDistrictRiskScores()
    ]);

    const weatherSnapshots = await prisma.weatherSnapshot.findMany({
      orderBy: { observedAt: "desc" },
      distinct: ["district"],
      take: 50
    });

    const cloudCoverage = weatherSnapshots.map((snapshot) =>
      marker(
        `cloud-${snapshot.id}`,
        snapshot.district,
        { lat: snapshot.latitude, lng: snapshot.longitude },
        riskLevel(Math.min(100, (snapshot.rainfallProbability ?? 0) + snapshot.humidity * 0.25)),
        snapshot.humidity,
        `${snapshot.humidity}% humidity / cloud proxy`,
        "cloud"
      )
    );

    const weatherSeverity = risks.map((risk) =>
      marker(`risk-${risk.district}`, risk.district, risk.coordinates, risk.level, risk.score, `${risk.level} operational risk`, "severity")
    );

    return {
      generatedAt: new Date().toISOString(),
      layers: {
        rainRadar: tiles.past,
        cloudCoverage,
        stormMovement: storms,
        floodRisk,
        weatherSeverity,
        incidentHeatmap: await this.getIncidentHeatmapMarkers(),
        evacuationZones: floodRisk
          .filter((zone) => zone.severity === "SEVERE" || zone.severity === "CRITICAL")
          .map((zone) => marker(`evac-${zone.id}`, zone.district, zone.coordinates, zone.severity, zone.probability, "Evacuation routing caution", "evacuation"))
      }
    };
  }

  async getRainIntensity(district = "Mumbai"): Promise<RainIntensity> {
    const profile = districtProfile(district);
    const latestFrame = await this.getLatestRadarFrame();
    const weather = await this.getWeatherSignal(profile.district, profile.coordinates);
    const estimated = estimateRainIntensity({
      rainfallProbability: weather.rainfallProbability,
      windSpeed: weather.windSpeed,
      humidity: weather.humidity,
      condition: weather.condition,
      frameAgeMinutes: frameAgeMinutes(latestFrame)
    });

    return {
      district: profile.district,
      coordinates: profile.coordinates,
      ...estimated,
      source: "rainviewer-weatherstack-fusion",
      observedAt: new Date().toISOString()
    };
  }

  async getFloodRisk(district?: string): Promise<FloodRiskZonePayload[]> {
    const districts = district ? [districtProfile(district)] : DEFAULT_DISTRICTS;
    const zones: FloodRiskZonePayload[] = [];

    for (const profile of districts) {
      const [rain, operations] = await Promise.all([
        this.getRainIntensity(profile.district),
        this.getOperationalSignals(profile.district, profile.coordinates)
      ]);

      const geographyBoost = profile.coastal || profile.riverine ? 12 : 0;
      const probability = Math.min(
        100,
        Math.round(rain.intensity * 0.46 + operations.sosDensity * 0.18 + operations.shelterOccupancy * 0.14 + operations.incidentSeverity * 0.1 + geographyBoost)
      );
      const severity = riskLevel(probability);
      const triggers = [
        ...(rain.intensity >= 65 ? ["heavy-rainfall-detected"] : []),
        ...(operations.sosDensity >= 45 ? ["repeated-sos-nearby"] : []),
        ...(profile.coastal ? ["coastal-district"] : []),
        ...(profile.riverine ? ["riverine-district"] : []),
        ...(operations.shelterOccupancy >= 80 ? ["shelter-overload"] : []),
        ...(rain.severity === "CRITICAL" ? ["critical-rainfall-intensity"] : [])
      ];

      if (probability >= 35 || triggers.length > 0) {
        const zone: FloodRiskZonePayload = {
          id: `${normalizeDistrictName(profile.district)}-${Date.now()}`,
          district: profile.district,
          state: profile.state,
          coordinates: profile.coordinates,
          probability,
          severity,
          triggers,
          recommendedActions: [
            "Update flood heat zones on the operational map.",
            "Pre-stage boats, ambulances, and volunteer teams outside projected flood cells.",
            "Route evacuation guidance away from severe rainfall sectors."
          ],
          createdAt: new Date().toISOString()
        };
        zones.push(zone);
      }
    }

    this.latestFloodZones = zones;
    await this.persistFloodRiskZones(zones);
    return zones;
  }

  async getStormTracking(): Promise<StormTrack[]> {
    const tiles = await this.getRadarTiles();
    const recentFrames = tiles.past.slice(-4);
    const tracks: StormTrack[] = [];

    for (const profile of DEFAULT_DISTRICTS.slice(0, 8)) {
      const rain = await this.getRainIntensity(profile.district);
      if (rain.intensity < 42) continue;

      const direction = Math.round((rain.coordinates.lng * 13 + rain.coordinates.lat * 7 + recentFrames.length * 31) % 360);
      const speedKmph = Math.max(12, Math.round(rain.intensity * 0.65));
      const trajectory = Array.from({ length: 4 }, (_, index) => ({
        lat: Number((rain.coordinates.lat + (index + 1) * 0.18 * Math.cos((direction * Math.PI) / 180)).toFixed(4)),
        lng: Number((rain.coordinates.lng + (index + 1) * 0.18 * Math.sin((direction * Math.PI) / 180)).toFixed(4))
      }));

      tracks.push({
        id: `storm-${normalizeDistrictName(profile.district)}`,
        name: `${profile.district} precipitation cell`,
        severity: severityFromRain(rain.intensity),
        intensity: rain.intensity,
        direction,
        speedKmph,
        centroid: rain.coordinates,
        trajectory,
        affectedDistricts: [profile.district],
        projectedImpact: rain.intensity >= 75 ? "Projected urban flooding and route disruption" : "Localized rainfall and response delays possible",
        updatedAt: new Date().toISOString()
      });
    }

    this.latestStorms = tracks;
    await this.persistStormEvents(tracks);
    return tracks;
  }

  async getDistrictRadar(district: string): Promise<DistrictRadarPayload> {
    const profile = districtProfile(district);
    const [latestFrame, rainIntensity, floodZones, stormTracking, operationalRisk] = await Promise.all([
      this.getLatestRadarFrame(),
      this.getRainIntensity(profile.district),
      this.getFloodRisk(profile.district),
      this.getStormTracking(),
      this.calculateDistrictRisk(profile.district, profile.state, profile.coordinates)
    ]);

    return {
      district: profile.district,
      state: profile.state,
      coordinates: profile.coordinates,
      latestFrame,
      rainIntensity,
      floodRisk: floodZones[0] ?? null,
      stormTracking: stormTracking.filter((storm) => storm.affectedDistricts.includes(profile.district)),
      operationalRisk
    };
  }

  async getDistrictRiskScores() {
    const risks: OperationalRiskScore[] = [];
    for (const profile of DEFAULT_DISTRICTS) {
      risks.push(await this.calculateDistrictRisk(profile.district, profile.state, profile.coordinates));
    }
    this.latestDistrictRisks = risks;
    await this.persistOperationalRisks(risks);
    return risks;
  }

  async refreshRadar() {
    return this.getRadarTiles();
  }

  async refreshStormAnalysis() {
    return this.getStormTracking();
  }

  async refreshFloodRiskAnalysis() {
    const [zones, risks] = await Promise.all([this.getFloodRisk(), this.getDistrictRiskScores()]);
    for (const zone of zones) {
      const risk = risks.find((item) => normalizeDistrictName(item.district) === normalizeDistrictName(zone.district));
      if (risk) await activateFloodAutomation(zone, risk);
    }
    return zones;
  }

  async recalculateOperationalRisk() {
    return this.getDistrictRiskScores();
  }

  private async calculateDistrictRisk(district: string, state: string, coordinates: Coordinates) {
    const [rain, operations, weather] = await Promise.all([
      this.getRainIntensity(district),
      this.getOperationalSignals(district, coordinates),
      this.getWeatherSignal(district, coordinates)
    ]);

    const input: OperationalRiskInput = {
      district,
      state,
      coordinates,
      rainIntensity: rain.intensity,
      windSpeed: Math.min(100, weather.windSpeed),
      floodProbability: Math.max(this.latestFloodZones.find((zone) => zone.district === district)?.probability ?? 0, rain.intensity * 0.72),
      sosDensity: operations.sosDensity,
      shelterOccupancy: operations.shelterOccupancy,
      volunteerAvailability: operations.volunteerAvailability,
      incidentSeverity: operations.incidentSeverity
    };

    return calculateOperationalRisk(input);
  }

  private async getWeatherSignal(district: string, coordinates: Coordinates) {
    try {
      const weather = await weatherService.getDistrictWeatherByName(`${district}, India`);
      return {
        rainfallProbability: weather.rainfallProbability,
        windSpeed: weather.windSpeed,
        humidity: weather.humidity,
        condition: weather.condition
      };
    } catch {
      const snapshot = await prisma.weatherSnapshot.findFirst({
        where: { district: { contains: district.split(",")[0] ?? district, mode: "insensitive" } },
        orderBy: { observedAt: "desc" }
      });
      if (snapshot) {
        return {
          rainfallProbability: snapshot.rainfallProbability ?? 0,
          windSpeed: snapshot.windSpeed,
          humidity: snapshot.humidity,
          condition: snapshot.condition
        };
      }
      return {
        rainfallProbability: 35,
        windSpeed: 18,
        humidity: 70,
        condition: `Radar watch near ${coordinates.lat.toFixed(2)},${coordinates.lng.toFixed(2)}`
      };
    }
  }

  private async getOperationalSignals(district: string, coordinates: Coordinates) {
    const districtFilter = district.split(",")[0]?.trim() || district;
    const since = new Date(Date.now() - 6 * 60 * 60 * 1000);

    const [sosRequests, shelters, volunteers] = await Promise.all([
      prisma.sOSRequest.findMany({
        where: {
          status: { in: [SOSStatus.PENDING, SOSStatus.ASSIGNED, SOSStatus.IN_PROGRESS] },
          createdAt: { gte: since },
          OR: [
            { user: { district: { contains: districtFilter, mode: "insensitive" } } },
            {
              latitude: { gte: coordinates.lat - 0.6, lte: coordinates.lat + 0.6 },
              longitude: { gte: coordinates.lng - 0.6, lte: coordinates.lng + 0.6 }
            }
          ]
        },
        select: { severity: true }
      }),
      prisma.shelter.findMany({
        where: {
          OR: [
            { district: { contains: districtFilter, mode: "insensitive" } },
            {
              latitude: { gte: coordinates.lat - 0.6, lte: coordinates.lat + 0.6 },
              longitude: { gte: coordinates.lng - 0.6, lte: coordinates.lng + 0.6 }
            }
          ]
        },
        select: { capacity: true, occupied: true }
      }),
      prisma.volunteer.findMany({
        where: { isAvailable: true },
        include: { user: { select: { latitude: true, longitude: true, district: true } } }
      })
    ]);

    const sosDensity = Math.min(100, sosRequests.length * 16);
    const totalCapacity = shelters.reduce((sum, shelter) => sum + Math.max(0, shelter.capacity), 0);
    const totalOccupied = shelters.reduce((sum, shelter) => sum + Math.max(0, shelter.occupied), 0);
    const shelterOccupancy = totalCapacity > 0 ? Math.min(100, Math.round((totalOccupied / totalCapacity) * 100)) : 35;
    const nearbyVolunteers = volunteers.filter((volunteer) => {
      if (volunteer.user.district && normalizeDistrictName(volunteer.user.district) === normalizeDistrictName(districtFilter)) return true;
      const lat = volunteer.user.latitude;
      const lng = volunteer.user.longitude;
      return lat != null && lng != null && Math.abs(lat - coordinates.lat) <= 0.6 && Math.abs(lng - coordinates.lng) <= 0.6;
    }).length;
    const volunteerAvailability = Math.min(100, nearbyVolunteers * 18);
    const incidentSeverity = sosRequests.length > 0
      ? Math.round(sosRequests.reduce((sum, request) => sum + mapSeverityToScore(request.severity), 0) / sosRequests.length)
      : 20;

    return { sosDensity, shelterOccupancy, volunteerAvailability, incidentSeverity };
  }

  private async getIncidentHeatmapMarkers() {
    const incidents = await prisma.sOSRequest.findMany({
      where: { status: { in: [SOSStatus.PENDING, SOSStatus.ASSIGNED, SOSStatus.IN_PROGRESS] } },
      include: { user: { select: { district: true } } },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return incidents.map((incident) =>
      marker(
        `incident-${incident.id}`,
        incident.user.district ?? "Unknown district",
        { lat: incident.latitude, lng: incident.longitude },
        riskLevel(mapSeverityToScore(incident.severity)),
        mapSeverityToScore(incident.severity),
        `${incident.type} SOS`,
        "incident"
      )
    );
  }

  private fallbackTiles(): RadarTilesPayload {
    const now = Math.floor(Date.now() / 1000);
    const host = "https://tilecache.rainviewer.com";
    const frames = [now - 1800, now - 1200, now - 600].map((time) => buildFrame(host, { time, path: `/v2/radar/${time}` }));
    const payload = {
      provider: "rainviewer" as const,
      version: "2.0",
      generatedAt: new Date().toISOString(),
      host,
      tileTemplate: `${host}{path}/512/{z}/{x}/{y}/2/1_1.png`,
      coverageTemplate: `${host}/v2/coverage/0/512/{z}/{x}/{y}/0/0_0.png`,
      past: frames,
      forecast: [],
      attribution: "RainViewer"
    };
    setCache("radar:tiles", payload, 30);
    return payload;
  }

  private async persistRadarSnapshot(payload: RadarTilesPayload) {
    const latest = payload.past.at(-1);
    await prisma.radarSnapshot.create({
      data: {
        provider: "rainviewer",
        version: payload.version,
        generatedAt: new Date(payload.generatedAt),
        host: payload.host,
        latestFrameTime: latest ? new Date(latest.time * 1000) : null,
        frames: toJson({ past: payload.past, forecast: payload.forecast }),
        tileTemplate: payload.tileTemplate,
        coverageTemplate: payload.coverageTemplate,
        raw: toJson(payload)
      }
    });
  }

  private async persistFloodRiskZones(zones: FloodRiskZonePayload[]) {
    await Promise.allSettled(
      zones.map((zone) =>
        prisma.floodRiskZone.create({
          data: {
            district: zone.district,
            state: zone.state,
            latitude: zone.coordinates.lat,
            longitude: zone.coordinates.lng,
            probability: zone.probability,
            severity: zone.severity,
            triggers: toJson(zone.triggers),
            recommendedActions: toJson(zone.recommendedActions),
            status: "active",
            payload: toJson(zone)
          }
        })
      )
    );
  }

  private async persistStormEvents(storms: StormTrack[]) {
    await Promise.allSettled(
      storms.map((storm) =>
        prisma.stormEvent.create({
          data: {
            name: storm.name,
            severity: storm.severity,
            intensity: storm.intensity,
            direction: storm.direction,
            speedKmph: storm.speedKmph,
            centroidLat: storm.centroid.lat,
            centroidLng: storm.centroid.lng,
            trajectory: toJson(storm.trajectory),
            affectedDistricts: toJson(storm.affectedDistricts),
            projectedImpact: storm.projectedImpact,
            payload: toJson(storm)
          }
        })
      )
    );
  }

  private async persistOperationalRisks(risks: OperationalRiskScore[]) {
    await Promise.allSettled(
      risks.map((risk) =>
        prisma.operationalRisk.create({
          data: {
            district: risk.district,
            state: risk.state ?? "India",
            latitude: risk.coordinates.lat,
            longitude: risk.coordinates.lng,
            score: risk.score,
            level: risk.level,
            rainIntensity: risk.rainIntensity,
            windSpeed: risk.windSpeed,
            floodProbability: risk.floodProbability,
            sosDensity: risk.sosDensity,
            shelterOccupancy: risk.shelterOccupancy,
            volunteerAvailability: risk.volunteerAvailability,
            incidentSeverity: risk.incidentSeverity,
            recommendations: toJson(risk.recommendations),
            payload: toJson(risk)
          }
        })
      )
    );
  }
}

export const radarService = new RadarService();
