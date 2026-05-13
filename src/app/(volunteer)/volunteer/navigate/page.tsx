"use client";

import Link from "next/link";

export default function NavigatePage() {
  return (
    <main className="flex-grow flex flex-col h-[calc(100vh-64px)]">
      <div className="bg-surface border-b border-outline-variant px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/volunteer" className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">arrow_back</Link>
          <h1 className="text-title-sm text-primary flex items-center gap-2"><span className="material-symbols-outlined">navigation</span>Field Navigation</h1>
        </div>
        <div className="flex gap-2">
          <button className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-label-caps hover:opacity-90 transition-opacity flex items-center gap-1"><span className="material-symbols-outlined text-sm">directions</span>ROUTE</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative bg-surface-dim">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#6750a4 0.5px, transparent 0.5px)", backgroundSize: "32px 32px", opacity: 0.08 }} />
          {/* Route Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 45 45 Q 50 30 55 35 Q 60 40 40 60" fill="none" stroke="#6750a4" strokeWidth="0.4" strokeDasharray="1,1" />
          </svg>
          {/* Origin */}
          <div className="absolute top-[45%] left-[45%]"><div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" /><div className="w-8 h-8 bg-blue-500/20 rounded-full absolute -top-2 -left-2 animate-pulse" /></div>
          {/* Destination */}
          <div className="absolute top-[35%] left-[55%]"><div className="w-5 h-5 bg-error rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span></div></div>
          {/* Waypoints */}
          <div className="absolute top-[60%] left-[40%]"><div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>home_pin</span></div></div>

          {/* Route Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 md:right-auto bg-surface/95 backdrop-blur p-4 rounded-xl border border-outline-variant shadow-lg max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-label-caps text-primary">ACTIVE ROUTE</span>
              <span className="text-mono-data text-on-surface-variant">ETA: 12 min</span>
            </div>
            <h3 className="text-title-sm text-on-surface mb-1">To: Water Distribution Point C</h3>
            <p className="text-body-sm text-on-surface-variant mb-3">North Community Center, Sector C-3</p>
            <div className="flex gap-4 text-body-sm">
              <span className="flex items-center gap-1 text-on-surface-variant"><span className="material-symbols-outlined text-sm">straighten</span>2.4 km</span>
              <span className="flex items-center gap-1 text-on-surface-variant"><span className="material-symbols-outlined text-sm">traffic</span>Light traffic</span>
            </div>
          </div>

          {/* Zoom */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="bg-surface rounded-xl shadow-lg border border-outline-variant p-1 flex flex-col gap-1">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high text-primary"><span className="material-symbols-outlined">add</span></button>
              <div className="h-px bg-outline-variant mx-1" />
              <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high text-primary"><span className="material-symbols-outlined">remove</span></button>
            </div>
          </div>
        </div>

        {/* Turn-by-turn sidebar */}
        <aside className="w-[300px] bg-surface border-l border-outline-variant hidden lg:flex flex-col">
          <div className="p-4 border-b border-outline-variant"><h3 className="text-title-sm">Turn-by-Turn</h3></div>
          <div className="flex-1 overflow-y-auto">
            {[
              { dir: "straight", text: "Head north on Main St", dist: "0.8 km" },
              { dir: "turn_right", text: "Turn right onto Oak Ave", dist: "0.4 km" },
              { dir: "turn_left", text: "Turn left onto Center Dr", dist: "0.6 km" },
              { dir: "flag", text: "Arrive at North Community Center", dist: "" },
            ].map((step, i) => (
              <div key={i} className={`p-4 border-b border-outline-variant flex items-start gap-3 ${i === 0 ? "bg-primary-container/10" : ""}`}>
                <span className="material-symbols-outlined text-primary">{step.dir}</span>
                <div><p className="text-body-base">{step.text}</p>{step.dist && <p className="text-mono-data text-on-surface-variant">{step.dist}</p>}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
