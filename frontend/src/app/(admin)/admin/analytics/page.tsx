"use client";

import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-display-lg text-primary">Operational Analytics</h1><p className="text-body-base text-on-surface-variant">Performance metrics, response efficiency, and resource utilization dashboards.</p></div>
        <div className="flex gap-2">
          <select className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-sm outline-none focus:border-primary"><option>Last 7 Days</option><option>Last 30 Days</option><option>Last Quarter</option></select>
          <button className="bg-surface border border-outline-variant px-3 py-2 rounded-lg text-label-caps text-on-surface-variant hover:bg-surface-container-high flex items-center gap-1"><span className="material-symbols-outlined text-sm">download</span>EXPORT</button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Avg Response Time", value: "14 min", change: "-12%", positive: true },
          { label: "Incidents Resolved", value: "89", change: "+8%", positive: true },
          { label: "Citizen Satisfaction", value: "92%", change: "+3%", positive: true },
          { label: "Resource Waste", value: "4.2%", change: "+1.1%", positive: false },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
            <p className="text-label-caps text-on-surface-variant mb-1">{kpi.label}</p>
            <p className="text-headline-md font-mono text-primary">{kpi.value}</p>
            <p className={`text-label-caps mt-1 ${kpi.positive ? "text-green-600" : "text-error"}`}>{kpi.change} vs last period</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Response Time Chart */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h3 className="text-title-sm mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">show_chart</span>Response Time Trend</h3>
          <div className="h-64 flex items-end gap-2 px-4">
            {[42, 38, 28, 22, 18, 14, 16, 12, 14, 11, 15, 14].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors" style={{ height: `${(h / 42) * 100}%` }} />
                <span className="text-[9px] text-on-surface-variant font-mono">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Distribution */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h3 className="text-title-sm mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">pie_chart</span>By Type</h3>
          <div className="space-y-3">
            {[
              { type: "Flooding", pct: 35, color: "bg-primary" },
              { type: "Power Outage", pct: 25, color: "bg-tertiary" },
              { type: "Fire", pct: 20, color: "bg-error" },
              { type: "Infrastructure", pct: 12, color: "bg-secondary" },
              { type: "Other", pct: 8, color: "bg-outline" },
            ].map((item) => (
              <div key={item.type}>
                <div className="flex justify-between text-body-sm mb-1"><span>{item.type}</span><span className="font-mono">{item.pct}%</span></div>
                <div className="w-full bg-outline-variant h-2 rounded-full"><div className={`${item.color} h-full rounded-full`} style={{ width: `${item.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resource Utilization */}
        <div className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h3 className="text-title-sm mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">inventory_2</span>Resource Utilization</h3>
          <div className="space-y-4">
            {[
              { resource: "Water Supplies", used: 78, total: "15,600 / 20,000 L" },
              { resource: "Medical Kits", used: 45, total: "450 / 1,000" },
              { resource: "Emergency Blankets", used: 62, total: "3,100 / 5,000" },
              { resource: "MRE Rations", used: 88, total: "8,800 / 10,000" },
            ].map((r) => (
              <div key={r.resource}>
                <div className="flex justify-between text-body-sm mb-1"><span>{r.resource}</span><span className="text-mono-data">{r.total}</span></div>
                <div className="w-full bg-outline-variant h-2 rounded-full"><div className={`${r.used > 80 ? "bg-error" : r.used > 60 ? "bg-tertiary" : "bg-primary"} h-full rounded-full`} style={{ width: `${r.used}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Region Performance */}
        <div className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <h3 className="text-title-sm mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">leaderboard</span>Region Performance</h3>
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant"><tr>{["REGION", "INCIDENTS", "AVG RESPONSE", "SCORE"].map((h) => <th key={h} className="pb-2 text-label-caps text-on-surface-variant">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-outline-variant">
              {[
                { region: "Central Coastal", incidents: 8, response: "12 min", score: "A" },
                { region: "Northern Metro", incidents: 4, response: "18 min", score: "B+" },
                { region: "Western Highland", incidents: 3, response: "22 min", score: "B" },
                { region: "Southern Industrial", incidents: 2, response: "9 min", score: "A+" },
              ].map((r) => (
                <tr key={r.region}>
                  <td className="py-2 text-body-base">{r.region}</td>
                  <td className="py-2 text-mono-data">{r.incidents}</td>
                  <td className="py-2 text-mono-data">{r.response}</td>
                  <td className="py-2 text-label-caps text-primary font-bold">{r.score}</td>
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
