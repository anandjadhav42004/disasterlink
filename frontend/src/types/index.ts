// ============================================
// User Types
// ============================================
export type UserRole = "citizen" | "volunteer" | "admin" | "coordinator";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  location?: Coordinates;
  isVerified: boolean;
  createdAt: string;
}

// ============================================
// Location Types
// ============================================
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// ============================================
// Incident Types
// ============================================
export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "active" | "pending" | "resolved" | "monitoring";
export type IncidentType =
  | "earthquake"
  | "flood"
  | "fire"
  | "hurricane"
  | "tornado"
  | "tsunami"
  | "landslide"
  | "chemical"
  | "biological"
  | "other";

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: Coordinates;
  address: string;
  reportedBy: string;
  assignedTo?: string;
  affectedPopulation: number;
  deployedResources: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// ============================================
// Shelter Types
// ============================================
export type ShelterStatus = "open" | "full" | "closed" | "maintenance";

export interface Shelter {
  id: string;
  name: string;
  address: string;
  location: Coordinates;
  capacity: number;
  currentOccupancy: number;
  status: ShelterStatus;
  amenities: string[];
  contact: string;
  operatingHours: string;
  lastUpdated: string;
}

// ============================================
// Alert Types
// ============================================
export type AlertSeverity = "critical" | "warning" | "info" | "all-clear";
export type AlertStatus = "active" | "expired" | "draft" | "scheduled";

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  affectedAreas: string[];
  issuedBy: string;
  issuedAt: string;
  expiresAt: string;
  broadcastChannels: string[];
}

// ============================================
// Volunteer Types
// ============================================
export type VolunteerStatus = "available" | "deployed" | "off-duty" | "standby";
export type VolunteerSpecialty =
  | "medical"
  | "search-rescue"
  | "logistics"
  | "communications"
  | "shelter-ops"
  | "transport"
  | "general";

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: VolunteerStatus;
  specialty: VolunteerSpecialty;
  certifications: string[];
  deployedTo?: string;
  sector?: string;
  hoursLogged: number;
  missionsCompleted: number;
  rating: number;
  location?: Coordinates;
  lastActive: string;
}

// ============================================
// SOS Types
// ============================================
export type SOSType = "medical" | "rescue" | "evacuation" | "supplies" | "shelter" | "other";
export type SOSStatus = "pending" | "acknowledged" | "in-progress" | "resolved" | "cancelled";

export interface SOSRequest {
  id: string;
  type: SOSType;
  status: SOSStatus;
  description: string;
  location: Coordinates;
  address: string;
  requestedBy: string;
  requestedAt: string;
  respondedAt?: string;
  resolvedAt?: string;
  assignedTeam?: string;
  priority: IncidentSeverity;
  peopleAffected: number;
}

// ============================================
// Dashboard Stats
// ============================================
export interface DashboardStats {
  activeIncidents: number;
  totalShelters: number;
  deployedVolunteers: number;
  activeAlerts: number;
  totalEvacuated: number;
  responseTimeAvg: string;
  resourceUtilization: number;
  pendingRequests: number;
}

// ============================================
// Navigation Types
// ============================================
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: NavItem[];
}

// ============================================
// API Types
// ============================================
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// ============================================
// Chart Data Types
// ============================================
export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  category?: string;
}

// ============================================
// Activity Feed
// ============================================
export type ActivityType =
  | "incident_created"
  | "incident_resolved"
  | "alert_issued"
  | "volunteer_deployed"
  | "shelter_opened"
  | "sos_received"
  | "resource_dispatched";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  metadata?: Record<string, string>;
}
