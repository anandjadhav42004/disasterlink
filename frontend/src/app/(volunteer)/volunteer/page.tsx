"use client";

import Link from "next/link";
import { useEffect } from "react";
import { WeatherWidget } from "@/components/weather/weather-widget";
import { useRotatingWeather } from "@/hooks/useRotatingWeather";
import { useWeatherStore } from "@/store/weather-store";

export default function VolunteerDashboard() {
  const { currentWeather, districtWeather, fetchWeatherWatchlist } = useWeatherStore();
  const rotatingWeather = useRotatingWeather(districtWeather, currentWeather);

  useEffect(() => {
    void fetchWeatherWatchlist();
  }, [fetchWeatherWatchlist]);

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="border-l-4 border-primary pl-4 py-1">
          <h1 className="text-display-lg text-on-surface">Volunteer Command</h1>
          <p className="text-body-base text-on-surface-variant">Field operations hub for registered volunteer personnel.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-error text-on-error px-4 py-2 rounded-lg text-label-caps hover:opacity-90 transition-opacity flex items-center gap-2"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>SOS</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Tasks", value: "3", icon: "task_alt", color: "text-primary" },
          { label: "Hours This Week", value: "18.5", icon: "schedule", color: "text-tertiary" },
          { label: "People Assisted", value: "47", icon: "groups", color: "text-primary" },
          { label: "Deployment Status", value: "ACTIVE", icon: "verified", color: "text-error" },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2"><span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span><span className="text-label-caps text-on-surface-variant">{s.label}</span></div>
            <p className={`text-headline-md font-mono ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tasks + Map */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Tasks */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-title-sm flex items-center gap-2"><span className="material-symbols-outlined text-primary">checklist</span>Active Assignments</h2>
              <Link href="/volunteer/tasks" className="text-label-caps text-primary hover:underline">VIEW ALL</Link>
            </div>
            <div className="divide-y divide-outline-variant">
              {[
                { title: "Water Distribution: Sector C", priority: "HIGH", priorityBg: "bg-error-container text-on-error-container", location: "Andheri Sports Complex", time: "Due in 2 hrs" },
                { title: "Shelter Setup: Arena B", priority: "MEDIUM", priorityBg: "bg-tertiary-container text-on-tertiary-container", location: "District Arena, Block 4", time: "Due in 5 hrs" },
                { title: "Supply Inventory Check", priority: "LOW", priorityBg: "bg-surface-container-high text-on-surface-variant", location: "Central Warehouse", time: "Due tomorrow" },
              ].map((t) => (
                <div key={t.title} className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-body-base font-bold">{t.title}</h3>
                    <span className={`${t.priorityBg} text-label-caps px-2 py-0.5 rounded`}>{t.priority}</span>
                  </div>
                  <div className="flex items-center gap-4 text-body-sm text-on-surface-variant">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{t.location}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{t.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment Map */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-title-sm flex items-center gap-2"><span className="material-symbols-outlined text-primary">map</span>Deployment Zone</h2>
              <Link href="/volunteer/navigate" className="text-label-caps text-primary hover:underline">NAVIGATE</Link>
            </div>
            <div className="h-64 relative bg-surface-dim">
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#6750a4 0.5px, transparent 0.5px)", backgroundSize: "32px 32px", opacity: 0.08 }} />
              <div className="absolute top-[30%] left-[40%]"><div className="w-5 h-5 bg-error rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[14px]">priority_high</span></div></div>
              <div className="absolute top-[60%] left-[55%]"><div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[14px]">home_pin</span></div></div>
              <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur px-3 py-1.5 rounded-lg border border-outline-variant shadow"><span className="text-label-caps text-on-surface-variant">YOUR ZONE: ANDHERI WEST</span></div>
            </div>
          </div>
        </div>

        {/* Right: Team + Status */}
        <div className="lg:col-span-4 space-y-6">
          <WeatherWidget weather={rotatingWeather} />

          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
            <h3 className="text-label-caps text-on-surface-variant mb-3">ROUTE WEATHER RISK</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-surface-container-low p-2"><p className="text-mono-data">{rotatingWeather?.visibility ?? "--"} km</p><p className="text-[10px] text-on-surface-variant">Visibility</p></div>
              <div className="rounded-md bg-surface-container-low p-2"><p className="text-mono-data">{rotatingWeather?.rainfallProbability ?? "--"}%</p><p className="text-[10px] text-on-surface-variant">Rain</p></div>
              <div className="rounded-md bg-surface-container-low p-2"><p className="text-mono-data">{rotatingWeather?.windSpeed ?? "--"}</p><p className="text-[10px] text-on-surface-variant">Wind</p></div>
            </div>
            <p className="mt-3 text-body-sm text-on-surface-variant">
              {rotatingWeather?.severity === "CRITICAL"
                ? "Critical field conditions. Confirm command clearance before deployment."
                : rotatingWeather?.severity === "SEVERE"
                  ? "Severe weather near deployment zone. Use guarded routing and team check-ins."
                  : "Weather conditions are acceptable for standard field operations."}
            </p>
          </div>

          {/* Team Chat */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl">
            <div className="p-4 border-b border-outline-variant"><h3 className="text-title-sm flex items-center gap-2"><span className="material-symbols-outlined text-secondary">forum</span>Team Comms</h3></div>
            <div className="p-4 space-y-3 max-h-[200px] overflow-y-auto">
              <div><p className="text-label-caps text-primary mb-0.5">CPT. REYNOLDS</p><p className="text-body-sm bg-surface-container-low p-2 rounded">Water trucks ETA 15 min at checkpoint B.</p></div>
              <div><p className="text-label-caps text-secondary mb-0.5">MED TEAM ALPHA</p><p className="text-body-sm bg-surface-container-low p-2 rounded">First-aid station operational at Arena B.</p></div>
              <div><p className="text-label-caps text-tertiary mb-0.5">LOGISTICS</p><p className="text-body-sm bg-surface-container-low p-2 rounded">Additional blankets dispatched to Sector C.</p></div>
            </div>
            <div className="p-4 border-t border-outline-variant"><input className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-low text-body-sm outline-none focus:border-primary" placeholder="Send team update..." /></div>
          </div>

          {/* Certification */}
          <div className="bg-primary text-on-primary p-6 rounded-xl">
            <span className="material-symbols-outlined text-4xl mb-4 block">workspace_premium</span>
            <h3 className="text-title-sm mb-2">Certification Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center"><span className="text-body-sm opacity-80">First Aid</span><span className="text-label-caps">VALID</span></div>
              <div className="flex justify-between items-center"><span className="text-body-sm opacity-80">Field Ops</span><span className="text-label-caps">VALID</span></div>
              <div className="flex justify-between items-center"><span className="text-body-sm opacity-80">Hazmat L1</span><span className="text-label-caps opacity-60">EXPIRED</span></div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
            <h3 className="text-label-caps text-on-surface-variant mb-3">QUICK ACTIONS</h3>
            <div className="space-y-2">
              <button className="w-full py-3 border border-primary text-primary rounded-lg text-label-caps hover:bg-primary-container/10 transition-colors flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">add_task</span>Request New Assignment</button>
              <button className="w-full py-3 border border-outline text-on-surface-variant rounded-lg text-label-caps hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">upload_file</span>Submit Field Report</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
