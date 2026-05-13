"use client";

export default function SheltersPage() {
  const shelters = [
    { name: "Northside Community Center", address: "1204 Oak Street, North Sector • 1.2 mi", status: "CRITICAL LOAD", statusBg: "bg-error-container text-on-error-container", occupancy: 94, total: "470/500", food: 30, water: 65, medical: 10 },
    { name: "St. Jude Regional Hall", address: "45 Broad Ave, Downtown • 3.5 mi", status: "STABLE", statusBg: "bg-secondary-container text-on-secondary-container", occupancy: 42, total: "210/500", food: 85, water: 90, medical: 75 },
    { name: "Unity Plaza Sports Complex", address: "88 Stadium Drive, South Sector • 5.1 mi", status: "HIGH CAPACITY", statusBg: "bg-primary-container/20 text-primary", occupancy: 15, total: "180/1200", food: 95, water: 95, medical: 90 },
  ];

  const getBarColor = (val: number) => val < 25 ? "bg-error" : val < 50 ? "bg-tertiary" : "bg-primary";

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Shelter List */}
        <section className="w-full md:w-[450px] bg-surface flex flex-col border-r border-outline-variant shrink-0">
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-title-sm text-on-surface">Nearby Shelters (12)</h2>
              <button className="text-primary text-label-caps border border-primary px-2 py-1 rounded hover:bg-primary-container/10">FILTER</button>
            </div>
            <div className="flex gap-2">
              <span className="bg-primary-container/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase border border-primary/20">Open Now</span>
              <span className="bg-on-surface-variant/10 text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold uppercase">Pet Friendly</span>
              <span className="bg-on-surface-variant/10 text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold uppercase">Medical Ready</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {shelters.map((s) => (
              <div key={s.name} className="p-6 border-b border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-body-base font-bold text-on-surface group-hover:text-primary transition-colors">{s.name}</h3>
                  <span className={`${s.statusBg} px-1 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight`}>{s.status}</span>
                </div>
                <div className="text-body-sm text-on-surface-variant mb-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>{s.address}
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] font-bold mb-1 text-on-surface-variant"><span>OCCUPANCY</span><span>{s.occupancy}% ({s.total})</span></div>
                  <div className="w-full bg-outline-variant h-2 rounded-full overflow-hidden"><div className={`${getBarColor(100 - s.occupancy)} h-full rounded-full`} style={{ width: `${s.occupancy}%` }} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[{ label: "Food", val: s.food }, { label: "Water", val: s.water }, { label: "Medical", val: s.medical }].map((r) => (
                    <div key={r.label}>
                      <div className="text-[9px] font-bold uppercase text-on-surface-variant mb-1">{r.label}</div>
                      <div className="h-1 bg-outline-variant rounded-full"><div className={`${getBarColor(r.val)} h-full rounded-full`} style={{ width: `${r.val}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map View */}
        <section className="flex-1 relative bg-surface-dim hidden md:block">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-surface-dim to-surface-container-highest" />
          {/* Simulated map grid */}
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#6750a4 0.5px, transparent 0.5px)", backgroundSize: "32px 32px", opacity: 0.1 }} />
          {/* Map Controls */}
          <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
            <div className="bg-surface rounded-xl shadow-lg border border-outline-variant p-1 flex flex-col gap-1">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high text-primary"><span className="material-symbols-outlined">add</span></button>
              <div className="h-[1px] bg-outline-variant mx-1" />
              <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high text-primary"><span className="material-symbols-outlined">remove</span></button>
            </div>
            <button className="bg-surface w-10 h-10 rounded-xl shadow-lg border border-outline-variant flex items-center justify-center text-primary hover:bg-surface-container-high"><span className="material-symbols-outlined">my_location</span></button>
            <button className="bg-surface w-10 h-10 rounded-xl shadow-lg border border-outline-variant flex items-center justify-center text-primary hover:bg-surface-container-high"><span className="material-symbols-outlined">layers</span></button>
          </div>
          {/* Map Markers */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[30%] left-[40%] pointer-events-auto">
              <div className="relative flex flex-col items-center">
                <div className="bg-error text-on-error p-2 rounded-full shadow-lg border-2 border-surface animate-pulse"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home_pin</span></div>
                <div className="bg-surface/90 backdrop-blur px-2 py-1 rounded-lg border border-outline shadow mt-1 text-[10px] font-bold">NORTHSIDE (94%)</div>
              </div>
            </div>
            <div className="absolute top-[60%] left-[55%] pointer-events-auto">
              <div className="relative flex flex-col items-center">
                <div className="bg-primary text-on-primary p-2 rounded-full shadow-lg border-2 border-surface"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home_pin</span></div>
                <div className="bg-surface/90 backdrop-blur px-2 py-1 rounded-lg border border-outline shadow mt-1 text-[10px] font-bold">ST. JUDE (42%)</div>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-surface/90 backdrop-blur p-4 rounded-xl border border-outline-variant shadow-lg max-w-[200px]">
            <h4 className="text-label-caps text-on-surface-variant mb-2">LEGEND</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-error" /><span className="text-body-sm font-mono">90%+ Capacity</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-tertiary" /><span className="text-body-sm font-mono">70-89% Capacity</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /><span className="text-body-sm font-mono">Below 70%</span></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
