"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Database, KeyRound, LockKeyhole, Radio, Settings, Shield, Users } from "lucide-react";
import Link from "next/link";
import { DistrictWeatherPanel } from "@/components/weather/district-weather-panel";
import { OperationalWeatherBar } from "@/components/weather/operational-weather-bar";
import { RainfallChart } from "@/components/weather/rainfall-chart";
import { WeatherRadar } from "@/components/weather/weather-radar";
import { useRotatingWeather } from "@/hooks/useRotatingWeather";
import { adminService, roleService } from "@/services";
import { useAuthStore } from "@/store/auth-store";
import { useWeatherStore } from "@/store/weather-store";
import { cn } from "@/lib/utils";

interface RoleRow {
  id: string;
  slug: string;
  name: string;
  description?: string;
  hierarchyLevel: number;
  accessScope: string;
  modules: string[];
  dashboards: string[];
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
}

interface PermissionRow {
  key: string;
  module: string;
  action: string;
  description: string;
}

interface AuditRow {
  id: string;
  action: string;
  module: string;
  severity: string;
  ip?: string;
  device?: string;
  createdAt: string;
  user?: { name: string; email: string; role: string } | null;
}

interface SessionRow {
  id: string;
  ip?: string;
  device?: string;
  lastSeenAt: string;
  user?: { name: string; email: string; role: string } | null;
}

interface AnalyticsPayload {
  openIncidents?: number;
  resolvedIncidents?: number;
  availableVolunteers?: number;
  shelters?: number;
  critical?: number;
}

const shellCards = [
  { label: "All-State Monitoring", icon: Radio, tone: "text-primary" },
  { label: "Emergency Override", icon: LockKeyhole, tone: "text-error" },
  { label: "Platform Settings", icon: Settings, tone: "text-tertiary" },
  { label: "Infrastructure Health", icon: Database, tone: "text-primary" },
];

export default function SuperAdminPage() {
  const { access } = useAuthStore();
  const {
    currentWeather,
    districtWeather,
    forecast,
    alerts,
    mapWeatherOverlay,
    fetchWeatherWatchlist,
    fetchForecast,
    fetchAlerts,
    fetchMapWeatherOverlay
  } = useWeatherStore();
  const rotatingWeather = useRotatingWeather(districtWeather, currentWeather);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsPayload>({});
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    name: "Relief Coordinator",
    description: "Coordinates relief operations across assigned regions.",
    hierarchyLevel: 35,
    accessScope: "district",
    modules: "incidents,volunteers,shelters,map",
    dashboards: "/admin",
    permissionKeys: "incidents.view,volunteers.assign,shelters.view,map.view"
  });

  useEffect(() => {
    async function load() {
      const [roleRes, permissionRes, auditRes, sessionRes, analyticsRes] = await Promise.allSettled([
        roleService.getRoles(),
        roleService.getPermissions(),
        roleService.getAuditLogs(),
        roleService.getSessions(),
        adminService.getAnalytics(),
      ]);

      if (roleRes.status === "fulfilled") setRoles(roleRes.value.data.data ?? []);
      if (permissionRes.status === "fulfilled") setPermissions(permissionRes.value.data.data ?? []);
      if (auditRes.status === "fulfilled") setAuditLogs(auditRes.value.data.data ?? []);
      if (sessionRes.status === "fulfilled") setSessions(sessionRes.value.data.data ?? []);
      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data.data ?? {});
      setIsLoading(false);
    }
    load();
    void fetchWeatherWatchlist();
    void fetchForecast("Mumbai");
    void fetchAlerts("Mumbai");
    void fetchMapWeatherOverlay();
  }, [fetchAlerts, fetchForecast, fetchMapWeatherOverlay, fetchWeatherWatchlist]);

  const permissionModules = useMemo(() => {
    return Array.from(new Set(permissions.map((permission) => permission.module))).sort();
  }, [permissions]);

  const createRole = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      hierarchyLevel: Number(form.hierarchyLevel),
      accessScope: form.accessScope,
      modules: splitList(form.modules),
      dashboards: splitList(form.dashboards),
      permissionKeys: splitList(form.permissionKeys),
      crud: { incidents: ["read", "update"], volunteers: ["assign"], shelters: ["read"] },
      featureAccess: splitList(form.modules),
    };
    const response = await roleService.createRole(payload);
    setRoles((current) => [response.data.data, ...current]);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="mb-6 border-b border-outline-variant pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-label-caps text-error">SUPER ADMIN COMMAND AUTHORITY</p>
            <h1 className="text-display-lg text-primary">Total Platform Control Center</h1>
            <p className="max-w-3xl text-body-base text-on-surface-variant">
              Enterprise RBAC, national visibility, live sessions, audit intelligence, and emergency override controls.
            </p>
          </div>
          <div className="rounded-md border border-error/30 bg-error-container px-4 py-3 text-on-error-container">
            <p className="text-label-caps">Hierarchy Level</p>
            <p className="text-headline-md font-mono">{access?.hierarchyLevel ?? 0}</p>
          </div>
        </div>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-5">
        <Metric label="Live Incidents" value={analytics.openIncidents ?? 0} icon={AlertTriangle} />
        <Metric label="Volunteers" value={analytics.availableVolunteers ?? 0} icon={Users} />
        <Metric label="Shelters" value={analytics.shelters ?? 0} icon={Shield} />
        <Metric label="Critical" value={analytics.critical ?? 0} icon={Radio} />
        <Metric label="Active Sessions" value={sessions.length} icon={Activity} />
      </section>

      <OperationalWeatherBar weather={rotatingWeather} alerts={alerts} />

      <section className="mb-6 grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <DistrictWeatherPanel weatherByDistrict={districtWeather} />
        </div>
        <div className="xl:col-span-4">
          <WeatherRadar overlay={mapWeatherOverlay} />
        </div>
        <div className="xl:col-span-3 space-y-4">
          <RainfallChart forecast={forecast} currentWeather={rotatingWeather} />
          <Link
            href="/admin/map"
            className="flex items-center justify-center rounded-md border border-primary/30 bg-primary-container/10 px-4 py-3 text-label-caps text-primary hover:bg-primary-container/20"
          >
            Open National Map
          </Link>
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        {shellCards.map(({ label, icon: Icon, tone }) => (
          <div key={label} className="rounded-md border border-outline-variant bg-surface-container-lowest p-4">
            <Icon className={cn("mb-3 h-5 w-5", tone)} />
            <p className="text-title-sm">{label}</p>
            <p className="text-body-sm text-on-surface-variant">Operational module available to unrestricted command authority.</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-md border border-outline-variant bg-surface-container-lowest p-5">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <h2 className="text-title-sm">Create Dynamic Role</h2>
          </div>
          <div className="space-y-3">
            <Field label="Role name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Field label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
            <Field label="Hierarchy level" value={String(form.hierarchyLevel)} onChange={(value) => setForm({ ...form, hierarchyLevel: Number(value) })} />
            <Field label="Access scope" value={form.accessScope} onChange={(value) => setForm({ ...form, accessScope: value })} />
            <Field label="Modules" value={form.modules} onChange={(value) => setForm({ ...form, modules: value })} />
            <Field label="Dashboards" value={form.dashboards} onChange={(value) => setForm({ ...form, dashboards: value })} />
            <Field label="Permissions" value={form.permissionKeys} onChange={(value) => setForm({ ...form, permissionKeys: value })} />
            <button onClick={createRole} className="w-full rounded-md bg-primary px-4 py-3 text-label-caps text-on-primary hover:opacity-90">
              Create Role
            </button>
          </div>
        </section>

        <section className="rounded-md border border-outline-variant bg-surface-container-lowest p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-title-sm">Role & Permission Management</h2>
            <span className="text-label-caps text-on-surface-variant">{isLoading ? "SYNCING" : `${roles.length} ROLES`}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="border-b border-outline-variant text-label-caps text-on-surface-variant">
                <tr>
                  <th className="py-2">Role</th>
                  <th>Level</th>
                  <th>Scope</th>
                  <th>Dashboards</th>
                  <th>Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className="py-3">
                      <p className="font-semibold">{role.name}</p>
                      <p className="text-mono-data text-on-surface-variant">{role.slug}</p>
                    </td>
                    <td className="font-mono">{role.hierarchyLevel}</td>
                    <td>{role.accessScope}</td>
                    <td>{role.dashboards.join(", ") || "None"}</td>
                    <td>{role.permissions.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-md border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-title-sm">Permission Matrix</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {permissionModules.map((module) => (
              <div key={module} className="rounded-md border border-outline-variant p-3">
                <p className="text-label-caps text-primary">{module}</p>
                <p className="text-body-sm text-on-surface-variant">
                  {permissions.filter((permission) => permission.module === module).map((permission) => permission.key).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="mb-4 text-title-sm">Audit Logs & Active Sessions</h2>
          <div className="mb-5 max-h-64 overflow-y-auto divide-y divide-outline-variant">
            {auditLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="py-3 text-body-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{log.action}</span>
                  <span className="text-mono-data text-on-surface-variant">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-on-surface-variant">{log.user?.email ?? "system"} / {log.module} / {log.severity}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-md bg-surface-container-low p-3 text-body-sm">
                <span>{session.user?.email ?? "unknown"}</span>
                <span className="text-on-surface-variant">{new Date(session.lastSeenAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface-container-lowest p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-label-caps text-on-surface-variant">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-headline-md font-mono text-primary">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-label-caps text-on-surface-variant">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-body-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
