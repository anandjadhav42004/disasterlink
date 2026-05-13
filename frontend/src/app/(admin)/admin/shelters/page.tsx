"use client";

import Link from "next/link";

export default function ShelterManagementPage() {
  const shelters = [
    { id: "SHL-01", name: "Northside Community Center", capacity: "470/500", pct: 94, status: "CRITICAL LOAD", statusBg: "bg-error-container text-on-error-container", manager: "Admin Reynolds" },
    { id: "SHL-02", name: "St. Jude Regional Hall", capacity: "210/500", pct: 42, status: "STABLE", statusBg: "bg-secondary-container text-on-secondary-container", manager: "Admin Chen" },
    { id: "SHL-03", name: "Unity Plaza Sports Complex", capacity: "180/1200", pct: 15, status: "HIGH CAPACITY", statusBg: "bg-primary-container/20 text-primary", manager: "Admin Rodriguez" },
    { id: "SHL-04", name: "South District Fire Station", capacity: "30/50", pct: 60, status: "MODERATE", statusBg: "bg-tertiary-container text-on-tertiary-container", manager: "Admin Mitchell" },
  ];

  const getBarColor = (val: number) => val > 85 ? "bg-error" : val > 60 ? "bg-tertiary" : "bg-primary";

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-display-lg text-primary">Shelter Management</h1><p className="text-body-base text-on-surface-variant">Monitor capacity, resources, and operations across all emergency shelters.</p></div>
        <button className="bg-primary text-on-primary px-6 py-3 rounded-lg text-label-caps hover:opacity-90 flex items-center gap-2"><span className="material-symbols-outlined">add_home</span>ADD SHELTER</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">TOTAL SHELTERS</p><p className="text-headline-md font-mono text-primary">12</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">TOTAL CAPACITY</p><p className="text-headline-md font-mono text-primary">4,250</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">CURRENT OCCUPANCY</p><p className="text-headline-md font-mono text-tertiary">2,890</p></div>
        <div className="bg-error-container border border-error p-4 rounded-xl"><p className="text-label-caps text-on-error-container">AT CAPACITY</p><p className="text-headline-md font-mono text-on-error-container">2</p></div>
      </div>

      {/* Shelter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shelters.map((s) => (
          <div key={s.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div><span className="text-mono-data text-on-surface-variant">{s.id}</span><h3 className="text-title-sm text-on-surface">{s.name}</h3></div>
              <span className={`${s.statusBg} text-label-caps px-2 py-0.5 rounded`}>{s.status}</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-label-caps text-on-surface-variant mb-1"><span>OCCUPANCY</span><span>{s.pct}% ({s.capacity})</span></div>
              <div className="w-full bg-outline-variant h-2 rounded-full overflow-hidden"><div className={`${getBarColor(s.pct)} h-full rounded-full transition-all`} style={{ width: `${s.pct}%` }} /></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-sm">person</span>{s.manager}</span>
              <button className="text-label-caps text-primary hover:underline">MANAGE</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6"><Link href="/admin" className="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 text-body-sm"><span className="material-symbols-outlined text-sm">arrow_back</span>Back to Command</Link></div>
    </main>
  );
}
