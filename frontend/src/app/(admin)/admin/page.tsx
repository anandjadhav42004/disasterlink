"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useOperationsStore } from "@/store/operations-store";

export default function AdminDashboard() {
  const { incidents, shelters, activeLayers, fetchIncidents, fetchShelters, declareEmergency, toggleLayer } = useOperationsStore();
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergency, setEmergency] = useState({ title: "", message: "", severity: "CRITICAL", district: "", state: "", deploymentLevel: "district", latitude: "19.076", longitude: "72.8777" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchIncidents();
    fetchShelters();
  }, [fetchIncidents, fetchShelters]);

  const activeIncidents = incidents.filter((incident) => !["RESOLVED", "CANCELLED"].includes(incident.status));
  const criticalCount = activeIncidents.filter((incident) => incident.severity === "CRITICAL").length;
  const shelterCapacity = useMemo(() => {
    const capacity = shelters.reduce((sum, shelter) => sum + shelter.capacity, 0);
    const occupied = shelters.reduce((sum, shelter) => sum + shelter.occupied, 0);
    return capacity ? Math.round((occupied / capacity) * 100) : 0;
  }, [shelters]);

  const submitEmergency = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await declareEmergency({ ...emergency, latitude: Number(emergency.latitude), longitude: Number(emergency.longitude) });
      toast.error("Emergency declared", { description: "Incident, alert, realtime broadcast, and audit log were created." });
      setShowEmergency(false);
    } catch {
      toast.error("Emergency declaration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="border-l-4 border-primary pl-4 py-1">
          <h1 className="text-display-lg text-on-surface">Operations Command</h1>
          <p className="text-body-base text-on-surface-variant">National emergency management administrative console.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowEmergency(true)} className="bg-error text-on-error px-4 py-2 rounded-lg text-label-caps hover:opacity-90 flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>DECLARE EMERGENCY</button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Active Incidents", value: String(activeIncidents.length), icon: "warning", color: "text-error", bg: "bg-error-container" },
          { label: "Critical Events", value: String(criticalCount), icon: "crisis_alert", color: "text-error", bg: "" },
          { label: "Shelters", value: String(shelters.length), icon: "home_pin", color: "text-primary", bg: "" },
          { label: "Shelter Capacity", value: `${shelterCapacity}%`, icon: "home_pin", color: "text-tertiary", bg: "" },
          { label: "Network Status", value: "Optimal", icon: "wifi", color: "text-primary", bg: "" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg || "bg-surface-container-lowest"} border border-outline-variant p-4 rounded-xl`}>
            <div className="flex items-center gap-2 mb-2"><span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span><span className="text-label-caps text-on-surface-variant">{s.label}</span></div>
            <p className={`text-headline-md font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incidents + Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Incidents Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-title-sm flex items-center gap-2"><span className="material-symbols-outlined text-error">crisis_alert</span>Active Incidents</h2>
              <Link href="/admin/incidents" className="text-label-caps text-primary hover:underline">VIEW ALL</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-high border-b border-outline-variant"><tr>{["ID", "INCIDENT", "SEVERITY", "REGION", "STATUS", "UPDATED"].map((h) => <th key={h} className="px-4 py-2 text-label-caps text-on-surface-variant">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-outline-variant">
                  {activeIncidents.slice(0, 5).map((incident) => (
                    <tr key={incident.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 text-mono-data text-primary">{incident.id.slice(0, 8)}</td>
                      <td className="px-4 py-3">{incident.description || incident.type}</td>
                      <td className="px-4 py-3"><span className={`${incident.severity === "CRITICAL" ? "bg-error text-on-error" : "bg-tertiary-container text-on-tertiary-container"} text-label-caps px-2 py-0.5 rounded`}>{incident.severity}</span></td>
                      <td className="px-4 py-3 text-body-sm">{incident.user?.district || "Field"}</td>
                      <td className="px-4 py-3 text-body-sm font-bold text-error">{incident.status}</td>
                      <td className="px-4 py-3 text-mono-data">{new Date(incident.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Map */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-title-sm flex items-center gap-2"><span className="material-symbols-outlined text-primary">public</span>National Overview</h2>
              <div className="flex gap-2">
                <button onClick={() => toggleLayer("heatmap")} className={`text-label-caps px-2 py-1 rounded ${activeLayers.heatmap ? "text-primary bg-primary-container/10 border border-primary/20" : "text-on-surface-variant bg-surface-container-high"}`}>HEAT MAP</button>
                <button onClick={() => toggleLayer("incidents")} className={`text-label-caps px-2 py-1 rounded ${activeLayers.incidents ? "text-primary bg-primary-container/10 border border-primary/20" : "text-on-surface-variant bg-surface-container-high"}`}>INCIDENTS</button>
              </div>
            </div>
            <div className="h-64 relative bg-surface-dim">
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#6750a4 0.5px, transparent 0.5px)", backgroundSize: "32px 32px", opacity: 0.08 }} />
              {activeLayers.heatmap && <div className="absolute top-[25%] left-[35%] w-28 h-28 bg-error/20 rounded-full blur-xl" />}
              {activeLayers.incidents && activeIncidents.slice(0, 8).map((incident, index) => (
                <div key={incident.id} className="absolute" style={{ top: `${20 + (index * 13) % 55}%`, left: `${25 + (index * 17) % 60}%` }}>
                  <div className="w-8 h-8 bg-error/20 rounded-full animate-ping" />
                  <div className="absolute top-2 left-2 w-4 h-4 bg-error rounded-full" title={incident.description} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions + System Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
            <h3 className="text-label-caps text-on-surface-variant mb-3">COMMAND ACTIONS</h3>
            <div className="space-y-2">
              <Link href="/admin/incidents" className="w-full py-3 bg-primary text-on-primary rounded-lg text-label-caps hover:opacity-90 transition-opacity flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">add_circle</span>Create Incident</Link>
              <Link href="/admin/volunteers" className="w-full py-3 border border-primary text-primary rounded-lg text-label-caps hover:bg-primary-container/10 transition-colors flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">group_add</span>Deploy Teams</Link>
              <Link href="/admin/notifications" className="w-full py-3 border border-outline text-on-surface-variant rounded-lg text-label-caps hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">campaign</span>Broadcast Alert</Link>
              <Link href="/admin/shelters" className="w-full py-3 border border-outline text-on-surface-variant rounded-lg text-label-caps hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">home_pin</span>Manage Shelters</Link>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-primary text-on-primary p-6 rounded-xl">
            <span className="material-symbols-outlined text-4xl mb-4 block">monitor_heart</span>
            <h3 className="text-title-sm mb-4">System Health</h3>
            <div className="space-y-3">
              {[
                { label: "API Gateway", status: "Operational", ok: true },
                { label: "Database Cluster", status: "Operational", ok: true },
                { label: "GIS Services", status: "Degraded", ok: false },
                { label: "Alert Engine", status: "Operational", ok: true },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-body-sm opacity-80">{s.label}</span>
                  <div className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${s.ok ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} /><span className="text-label-caps">{s.status}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
            <div className="p-4 border-b border-outline-variant"><h3 className="text-title-sm">Activity Log</h3></div>
            <div className="divide-y divide-outline-variant max-h-[200px] overflow-y-auto">
              {[
                { user: "Admin Patil", action: "Deployed Team Bravo to Sector C (Andheri)", time: "3 min ago" },
                { user: "System", action: "Auto-escalated INC-2041 to CRITICAL", time: "5 min ago" },
                { user: "Admin Chen", action: "Updated shelter capacity for Arena B", time: "12 min ago" },
              ].map((a, i) => (
                <div key={i} className="p-3 hover:bg-surface-container-low transition-colors">
                  <p className="text-body-sm"><strong className="text-primary">{a.user}:</strong> {a.action}</p>
                  <p className="text-mono-data text-on-surface-variant">{a.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showEmergency && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={submitEmergency} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-start">
              <div><h2 className="text-title-sm text-error">Declare Emergency</h2><p className="text-body-sm text-on-surface-variant">Creates an incident, broadcasts alerts, and writes audit history.</p></div>
              <button type="button" onClick={() => setShowEmergency(false)} className="material-symbols-outlined">close</button>
            </div>
            <input required value={emergency.title} onChange={(e) => setEmergency({ ...emergency, title: e.target.value })} className="w-full p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Emergency title" />
            <textarea required value={emergency.message} onChange={(e) => setEmergency({ ...emergency, message: e.target.value })} className="w-full p-3 rounded-lg border border-outline-variant bg-surface min-h-24" placeholder="Operational alert message" />
            <div className="grid grid-cols-2 gap-3">
              <select value={emergency.severity} onChange={(e) => setEmergency({ ...emergency, severity: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface"><option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select>
              <select value={emergency.deploymentLevel} onChange={(e) => setEmergency({ ...emergency, deploymentLevel: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface"><option value="district">District Response</option><option value="state">State Response</option><option value="national">National Response</option></select>
              <input required value={emergency.district} onChange={(e) => setEmergency({ ...emergency, district: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="District" />
              <input required value={emergency.state} onChange={(e) => setEmergency({ ...emergency, state: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="State" />
              <input value={emergency.latitude} onChange={(e) => setEmergency({ ...emergency, latitude: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Latitude" />
              <input value={emergency.longitude} onChange={(e) => setEmergency({ ...emergency, longitude: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Longitude" />
            </div>
            <button disabled={isSubmitting} className="w-full bg-error text-on-error py-3 rounded-lg text-label-caps disabled:opacity-60">{isSubmitting ? "Broadcasting..." : "Declare and Broadcast"}</button>
          </form>
        </div>
      )}
    </main>
  );
}
