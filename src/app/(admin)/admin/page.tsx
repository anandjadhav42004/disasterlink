"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="border-l-4 border-primary pl-4 py-1">
          <h1 className="text-display-lg text-on-surface">Operations Command</h1>
          <p className="text-body-base text-on-surface-variant">National emergency management administrative console.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-error text-on-error px-4 py-2 rounded-lg text-label-caps hover:opacity-90 flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>DECLARE EMERGENCY</button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Active Incidents", value: "14", icon: "warning", color: "text-error", bg: "bg-error-container" },
          { label: "Deployed Teams", value: "87", icon: "groups", color: "text-primary", bg: "" },
          { label: "Citizens Affected", value: "12,842", icon: "person_search", color: "text-primary", bg: "" },
          { label: "Shelter Capacity", value: "72%", icon: "home_pin", color: "text-tertiary", bg: "" },
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
                  <tr className="hover:bg-surface-container-low transition-colors"><td className="px-4 py-3 text-mono-data text-primary">INC-2041</td><td className="px-4 py-3">Flash Flooding: Central</td><td className="px-4 py-3"><span className="bg-error text-on-error text-label-caps px-2 py-0.5 rounded">CRITICAL</span></td><td className="px-4 py-3 text-body-sm">Central Coastal</td><td className="px-4 py-3 text-body-sm font-bold text-error">Active</td><td className="px-4 py-3 text-mono-data">2 min ago</td></tr>
                  <tr className="hover:bg-surface-container-low transition-colors"><td className="px-4 py-3 text-mono-data text-primary">INC-2040</td><td className="px-4 py-3">Power Grid Instability</td><td className="px-4 py-3"><span className="bg-tertiary-container text-on-tertiary-container text-label-caps px-2 py-0.5 rounded">HIGH</span></td><td className="px-4 py-3 text-body-sm">Northern Metro</td><td className="px-4 py-3 text-body-sm font-bold text-tertiary">Monitoring</td><td className="px-4 py-3 text-mono-data">14 min ago</td></tr>
                  <tr className="hover:bg-surface-container-low transition-colors"><td className="px-4 py-3 text-mono-data text-primary">INC-2039</td><td className="px-4 py-3">Road Closure: Hwy 12</td><td className="px-4 py-3"><span className="bg-surface-container-high text-on-surface-variant text-label-caps px-2 py-0.5 rounded">MEDIUM</span></td><td className="px-4 py-3 text-body-sm">Western Highland</td><td className="px-4 py-3 text-body-sm font-bold text-primary">Ongoing</td><td className="px-4 py-3 text-mono-data">28 min ago</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Operational Map */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-title-sm flex items-center gap-2"><span className="material-symbols-outlined text-primary">public</span>National Overview</h2>
              <div className="flex gap-2">
                <button className="text-label-caps text-on-surface-variant bg-surface-container-high px-2 py-1 rounded hover:bg-surface-container-highest">HEAT MAP</button>
                <button className="text-label-caps text-primary bg-primary-container/10 px-2 py-1 rounded border border-primary/20">INCIDENTS</button>
              </div>
            </div>
            <div className="h-64 relative bg-surface-dim">
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#6750a4 0.5px, transparent 0.5px)", backgroundSize: "32px 32px", opacity: 0.08 }} />
              <div className="absolute top-[25%] left-[35%]"><div className="w-10 h-10 bg-error/20 rounded-full animate-ping" /><div className="absolute top-2 left-2 w-6 h-6 bg-error rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[16px]">water_damage</span></div></div>
              <div className="absolute top-[55%] left-[60%]"><div className="w-6 h-6 bg-tertiary/20 rounded-full animate-ping" /><div className="absolute top-1 left-1 w-4 h-4 bg-tertiary rounded-full" /></div>
              <div className="absolute top-[40%] left-[70%] w-4 h-4 bg-primary rounded-full" />
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
                { user: "Admin Reynolds", action: "Deployed Team Bravo to Sector C", time: "3 min ago" },
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
    </main>
  );
}
