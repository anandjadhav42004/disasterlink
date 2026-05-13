import type { Coordinates } from "../utils/haversine.js";
import { haversineDistance } from "../utils/haversine.js";

export function distanceKm(from: Coordinates, to: Coordinates) {
  return haversineDistance(from, to);
}

export function withinRadius(from: Coordinates, to: Coordinates, radiusKm: number) {
  return distanceKm(from, to) <= radiusKm;
}
