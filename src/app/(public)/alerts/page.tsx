"use client";

import { useState } from "react";

export default function AlertsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>("CRITICAL");

  return (
    <div className="min-h-screen text-on-background">
      <main className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col md:flex-row gap-6">
        {/* Left Column: Filters & Status */}
        <aside className="w-full md:w-[320px] flex flex-col gap-6 shrink-0">
          {/* System Status */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4">
            <h2 className="text-label-caps text-on-surface-variant mb-4">SYSTEM STATUS</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-3 h-3 rounded-full bg-error animate-pulse" />
              <span className="text-title-sm text-error">Active Emergency</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-body-sm"><span className="text-on-surface-variant">Active Incidents</span><span className="font-bold">14</span></div>
              <div className="flex justify-between text-body-sm"><span className="text-on-surface-variant">Evacuations</span><span className="font-bold">3 zones</span></div>
              <div className="flex justify-between text-body-sm"><span className="text-on-surface-variant">Last Update</span><span className="text-mono-data">14:02 UTC</span></div>
            </div>
          </div>

          {/* Severity Filters */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4">
            <h2 className="text-label-caps text-on-surface-variant mb-4">SEVERITY FILTERS</h2>
            <div className="flex flex-col gap-1">
              <button onClick={() => setSelectedSeverity("CRITICAL")} className={`flex items-center justify-between w-full p-2 rounded-lg border ${selectedSeverity === "CRITICAL" ? "bg-error-container text-on-error-container border-error/20" : "bg-surface-container border-outline-variant"}`}>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span><span className="text-label-caps">CRITICAL</span></div>
                <span className="font-mono">04</span>
              </button>
              <button onClick={() => setSelectedSeverity("WARNING")} className={`flex items-center justify-between w-full p-2 rounded-lg ${selectedSeverity === "WARNING" ? "bg-tertiary-container text-on-tertiary-container" : "bg-surface-container text-on-surface-variant"}`}>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined">priority_high</span><span className="text-label-caps">WARNING</span></div>
                <span className="font-mono">12</span>
              </button>
              <button onClick={() => setSelectedSeverity("STABLE")} className={`flex items-center justify-between w-full p-2 rounded-lg ${selectedSeverity === "STABLE" ? "bg-surface-container-high text-on-surface" : "bg-surface-container text-on-surface-variant"}`}>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span><span className="text-label-caps">STABLE / SAFE</span></div>
                <span className="font-mono">48</span>
              </button>
            </div>
          </div>

          {/* Region Selector */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4">
            <h2 className="text-label-caps text-on-surface-variant mb-2">DISTRICT / REGION</h2>
            <select className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-body-base focus:ring-2 focus:ring-primary outline-none">
              <option>All Districts</option>
              <option>Northern Metropolitan</option>
              <option>Central Coastal</option>
              <option>Western Highlands</option>
              <option>Southern Industrial</option>
            </select>
            <div className="mt-4 flex flex-wrap gap-1">
              {["Zone A-4", "Zone B-1", "Zone C-2"].map((z) => (
                <span key={z} className="bg-secondary-container text-on-secondary-container text-label-caps px-2 py-1 rounded">{z}</span>
              ))}
            </div>
          </div>

          {/* Broadcast Preview */}
          <div className="relative overflow-hidden rounded-lg border border-outline-variant aspect-[4/3] bg-surface-container-highest">
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-surface-dim to-inverse-surface" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
              <span className="text-white text-label-caps mb-1">LIVE BROADCAST</span>
              <h3 className="text-white font-bold text-title-sm">Operational Briefing: Flash Flooding</h3>
            </div>
          </div>
        </aside>

        {/* Right Column: Alert Feed */}
        <section className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-display-lg text-primary">Operational Feed</h1>
            <div className="flex gap-2">
              <button className="bg-surface border border-outline p-2 rounded-lg flex items-center gap-2 text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">download</span>
                <span className="text-label-caps">EXPORT REPORT</span>
              </button>
              <button className="bg-primary text-on-primary p-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined">campaign</span>
                <span className="text-label-caps">NOTIFY ME</span>
              </button>
            </div>
          </div>

          {/* Bento Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Critical Alert - Double Width */}
            <div className="md:col-span-2 bg-surface-container-lowest border-l-8 border-error border-y border-r border-outline-variant rounded-lg p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-error text-on-error text-label-caps px-4 py-1 rounded">CRITICAL</span>
                  <span className="text-on-surface-variant text-mono-data">ID: ALRT-8842</span>
                </div>
                <span className="text-on-surface-variant text-mono-data">2 MINS AGO</span>
              </div>
              <h2 className="text-headline-md text-on-background mb-2">Immediate Evacuation: Central Coastal District</h2>
              <p className="text-body-base text-on-surface-variant mb-4 leading-relaxed">Severe storm surge and flash flooding imminent for all low-lying areas in the Central Coastal District. Residents in Zone A-4 and B-1 must evacuate to designated shelters immediately.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-outline-variant pt-4">
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-error">water_damage</span><div><p className="text-label-caps text-on-surface-variant">THREAT TYPE</p><p className="text-body-sm font-bold">Severe Flooding</p></div></div>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">location_on</span><div><p className="text-label-caps text-on-surface-variant">AFFECTED REGION</p><p className="text-body-sm font-bold">Zones A-4, B-1, C-2</p></div></div>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">home_pin</span><div><p className="text-label-caps text-on-surface-variant">SHELTER STATUS</p><p className="text-body-sm font-bold">4 Open, 2 Capacity</p></div></div>
              </div>
            </div>

            {/* Warning Card */}
            <div className="bg-surface-container-lowest border-l-8 border-tertiary border-y border-r border-outline-variant rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-tertiary-container text-on-tertiary-container text-label-caps px-2 py-1 rounded">WARNING</span>
                <span className="text-on-surface-variant text-mono-data">14 MINS AGO</span>
              </div>
              <h3 className="text-title-sm mb-1">Grid Instability Detected</h3>
              <p className="text-body-sm text-on-surface-variant mb-4">Localized power outages reported in Northern Metropolitan area. Maintenance crews dispatched.</p>
              <a className="text-primary text-label-caps flex items-center gap-1 hover:underline" href="#">VIEW DETAILS <span className="material-symbols-outlined text-[14px]">arrow_forward</span></a>
            </div>

            {/* Map Integration */}
            <div className="bg-surface-container-highest border border-outline-variant rounded-lg relative overflow-hidden h-[200px]">
              <div className="absolute inset-0 bg-secondary-container/20">
                <div className="w-full h-full opacity-30" style={{ backgroundImage: "radial-gradient(#6750a4 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                <div className="absolute top-1/4 left-1/3 w-10 h-10 bg-error/20 rounded-full animate-ping" />
                <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-error rounded-full" />
                <div className="absolute top-2/3 left-1/2 w-8 h-8 bg-tertiary/20 rounded-full animate-ping" />
                <div className="absolute top-2/3 left-1/2 w-3 h-3 bg-tertiary rounded-full" />
              </div>
              <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm p-2 rounded border border-outline-variant shadow-sm">
                <span className="text-label-caps text-on-surface-variant">CURRENT HOTSPOTS</span>
              </div>
            </div>

            {/* Stable Card */}
            <div className="bg-surface-container-lowest border-l-8 border-outline border-y border-r border-outline-variant rounded-lg p-4 opacity-75">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-surface-container-high text-on-surface-variant text-label-caps px-2 py-1 rounded">STABLE</span>
                <span className="text-on-surface-variant text-mono-data">1 HOUR AGO</span>
              </div>
              <h3 className="text-title-sm mb-1">Water Quality Cleared</h3>
              <p className="text-body-sm text-on-surface-variant mb-4">Boil water advisory lifted for Western Highlands. Normal usage can resume.</p>
              <div className="flex items-center gap-2 text-outline"><span className="material-symbols-outlined text-[18px]">verified</span><span className="text-label-caps">RESOLVED</span></div>
            </div>

            {/* Weather Card */}
            <div className="bg-primary text-on-primary rounded-lg p-4 flex flex-col justify-between overflow-hidden relative">
              <span className="material-symbols-outlined absolute -top-4 -right-4 text-[120px] opacity-10">thunderstorm</span>
              <div>
                <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined">air</span><span className="text-label-caps">WEATHER WATCH</span></div>
                <h3 className="text-title-sm mb-2">High Wind Advisory</h3>
                <p className="text-body-sm opacity-90 leading-relaxed">Gusts up to 60mph expected between 18:00 and 22:00 tonight. Secure outdoor furniture and avoid travel.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-on-primary/20 flex justify-between items-center">
                <span className="text-label-caps">NEXT UPDATE: 16:00</span>
                <button className="bg-on-primary text-primary px-2 py-1 rounded text-label-caps hover:bg-surface-container-high transition-colors">DETAILS</button>
              </div>
            </div>
          </div>

          {/* Event Log Table */}
          <div className="mt-6">
            <h2 className="text-label-caps text-on-surface-variant mb-4">CHRONOLOGICAL EVENT LOG</h2>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-high border-b border-outline-variant">
                  <tr>
                    {["TIME", "INCIDENT", "DISTRICT", "SEVERITY", "STATUS"].map((h) => (
                      <th key={h} className="px-4 py-2 text-label-caps text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  <tr className="bg-white hover:bg-surface-container-low transition-colors h-10">
                    <td className="px-4 py-2 font-mono text-body-sm">13:45</td>
                    <td className="px-4 py-2 text-body-sm">Local Fire Response</td>
                    <td className="px-4 py-2 text-body-sm">North Metro</td>
                    <td className="px-4 py-2"><span className="bg-tertiary-container text-on-tertiary-container text-[10px] px-2 py-0.5 rounded font-bold uppercase">Med</span></td>
                    <td className="px-4 py-2 text-body-sm font-bold text-primary">Ongoing</td>
                  </tr>
                  <tr className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors h-10">
                    <td className="px-4 py-2 font-mono text-body-sm">13:22</td>
                    <td className="px-4 py-2 text-body-sm">Road Closure: Hwy 12</td>
                    <td className="px-4 py-2 text-body-sm">Western High</td>
                    <td className="px-4 py-2"><span className="bg-error-container text-on-error-container text-[10px] px-2 py-0.5 rounded font-bold uppercase">High</span></td>
                    <td className="px-4 py-2 text-body-sm font-bold text-primary">Active</td>
                  </tr>
                  <tr className="bg-white hover:bg-surface-container-low transition-colors h-10">
                    <td className="px-4 py-2 font-mono text-body-sm">12:50</td>
                    <td className="px-4 py-2 text-body-sm">Gas Leak Inspection</td>
                    <td className="px-4 py-2 text-body-sm">Southern Ind</td>
                    <td className="px-4 py-2"><span className="bg-surface-container-high text-on-surface-variant text-[10px] px-2 py-0.5 rounded font-bold uppercase">Low</span></td>
                    <td className="px-4 py-2 text-body-sm text-outline">Resolved</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Back to Top FAB */}
      <button className="fixed bottom-6 right-6 bg-primary text-on-primary w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-95 transition-transform active:scale-90 z-50">
        <span className="material-symbols-outlined">expand_less</span>
      </button>
    </div>
  );
}
