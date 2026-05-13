"use client";

import Link from "next/link";

export default function IncidentsPage() {
  const incidents = [
    { id: "INC-2041", title: "Flash Flooding: Central Coastal", severity: "CRITICAL", severityBg: "bg-error text-on-error", region: "Central Coastal", status: "Active", teams: 12, affected: 4200, updated: "2 min ago" },
    { id: "INC-2040", title: "Power Grid Instability", severity: "HIGH", severityBg: "bg-tertiary-container text-on-tertiary-container", region: "Northern Metro", status: "Monitoring", teams: 4, affected: 890, updated: "14 min ago" },
    { id: "INC-2039", title: "Road Closure: Highway 12", severity: "MEDIUM", severityBg: "bg-surface-container-high text-on-surface-variant", region: "Western Highland", status: "Ongoing", teams: 2, affected: 320, updated: "28 min ago" },
    { id: "INC-2038", title: "Gas Leak: Industrial Zone B", severity: "LOW", severityBg: "bg-surface-container-high text-outline", region: "Southern Industrial", status: "Resolved", teams: 1, affected: 45, updated: "1 hr ago" },
  ];

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-display-lg text-primary">Incident Management</h1><p className="text-body-base text-on-surface-variant">Create, track, and resolve emergency incidents across all regions.</p></div>
        <button className="bg-error text-on-error px-6 py-3 rounded-lg text-label-caps hover:opacity-90 flex items-center gap-2"><span className="material-symbols-outlined">add_circle</span>NEW INCIDENT</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["All (14)", "Critical (4)", "High (3)", "Medium (5)", "Resolved (2)"].map((f, i) => (
          <button key={f} className={`px-4 py-2 rounded-lg text-label-caps whitespace-nowrap transition-colors ${i === 0 ? "bg-primary text-on-primary" : "bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"}`}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant"><tr>{["ID", "INCIDENT", "SEVERITY", "REGION", "STATUS", "TEAMS", "AFFECTED", "UPDATED"].map((h) => <th key={h} className="px-4 py-3 text-label-caps text-on-surface-variant whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-outline-variant">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-mono-data text-primary font-bold">{inc.id}</td>
                  <td className="px-4 py-3 text-body-base">{inc.title}</td>
                  <td className="px-4 py-3"><span className={`${inc.severityBg} text-label-caps px-2 py-0.5 rounded`}>{inc.severity}</span></td>
                  <td className="px-4 py-3 text-body-sm">{inc.region}</td>
                  <td className="px-4 py-3 text-body-sm font-bold">{inc.status}</td>
                  <td className="px-4 py-3 text-mono-data">{inc.teams}</td>
                  <td className="px-4 py-3 text-mono-data">{inc.affected.toLocaleString()}</td>
                  <td className="px-4 py-3 text-mono-data text-on-surface-variant">{inc.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6"><Link href="/admin" className="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 text-body-sm"><span className="material-symbols-outlined text-sm">arrow_back</span>Back to Command</Link></div>
    </main>
  );
}
