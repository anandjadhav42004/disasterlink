"use client";

export default function LiveMapPage() {
  return (
    <main className="flex-grow flex flex-col h-[calc(100vh-64px)]">
      {/* Top Controls */}
      <div className="bg-surface border-b border-outline-variant px-4 py-3 flex items-center justify-between gap-4">
        <h1 className="text-title-sm text-primary flex items-center gap-2"><span className="material-symbols-outlined">public</span>Live Disaster Map</h1>
        <div className="flex gap-2">
          <button className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-lg text-label-caps hover:bg-surface-container-highest transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-sm">layers</span>LAYERS</button>
          <button className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-lg text-label-caps hover:bg-surface-container-highest transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-sm">filter_list</span>FILTERS</button>
          <button className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-label-caps hover:opacity-90 transition-opacity flex items-center gap-1"><span className="material-symbols-outlined text-sm">my_location</span>MY LOCATION</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative bg-surface-dim">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#6750a4 0.5px, transparent 0.5px)", backgroundSize: "32px 32px", opacity: 0.08 }} />
          {/* Incident Markers */}
          <div className="absolute top-[25%] left-[35%]"><div className="w-8 h-8 bg-error/20 rounded-full animate-ping absolute" /><div className="w-5 h-5 bg-error rounded-full flex items-center justify-center relative z-10"><span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>water_damage</span></div></div>
          <div className="absolute top-[55%] left-[60%]"><div className="w-6 h-6 bg-tertiary/20 rounded-full animate-ping absolute" /><div className="w-5 h-5 bg-tertiary rounded-full flex items-center justify-center relative z-10"><span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>traffic</span></div></div>
          <div className="absolute top-[40%] left-[50%]"><div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_pin</span></div></div>
          <div className="absolute top-[70%] left-[30%]"><div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_pin</span></div></div>
          {/* My Location */}
          <div className="absolute top-[45%] left-[45%]"><div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" /><div className="w-8 h-8 bg-blue-500/20 rounded-full absolute -top-2 -left-2 animate-pulse" /></div>
          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="bg-surface rounded-xl shadow-lg border border-outline-variant p-1 flex flex-col gap-1">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high text-primary"><span className="material-symbols-outlined">add</span></button>
              <div className="h-px bg-outline-variant mx-1" />
              <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high text-primary"><span className="material-symbols-outlined">remove</span></button>
            </div>
          </div>
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur p-4 rounded-xl border border-outline-variant shadow-lg">
            <h4 className="text-label-caps text-on-surface-variant mb-2">LEGEND</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-error" /><span className="text-body-sm">Critical Incident</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-tertiary" /><span className="text-body-sm">Warning Zone</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /><span className="text-body-sm">Shelter/Resource</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-body-sm">Your Location</span></div>
            </div>
          </div>
        </div>

        {/* Sidebar: Incident List */}
        <aside className="w-[320px] bg-surface border-l border-outline-variant hidden lg:flex flex-col">
          <div className="p-4 border-b border-outline-variant"><h3 className="text-title-sm flex items-center gap-2"><span className="material-symbols-outlined text-error">warning</span>Active Incidents (3)</h3></div>
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant">
            <div className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer border-l-4 border-error">
              <span className="text-label-caps text-error">CRITICAL</span>
              <p className="text-body-base font-bold mt-1">Flash Flood: Downtown</p>
              <p className="text-body-sm text-on-surface-variant">Zone A-4 evacuation in progress</p>
              <p className="text-mono-data text-on-surface-variant mt-1">12 min ago</p>
            </div>
            <div className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer border-l-4 border-tertiary">
              <span className="text-label-caps text-tertiary">WARNING</span>
              <p className="text-body-base font-bold mt-1">Road Closure: Hwy 12</p>
              <p className="text-body-sm text-on-surface-variant">Debris clearance underway</p>
              <p className="text-mono-data text-on-surface-variant mt-1">28 min ago</p>
            </div>
            <div className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer border-l-4 border-primary">
              <span className="text-label-caps text-primary">INFO</span>
              <p className="text-body-base font-bold mt-1">Power Outage: North Sector</p>
              <p className="text-body-sm text-on-surface-variant">Scheduled maintenance 14:00-16:00</p>
              <p className="text-mono-data text-on-surface-variant mt-1">1 hr ago</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
