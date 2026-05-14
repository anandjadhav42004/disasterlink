"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminService } from "@/services";

export default function AnalyticsPage() {
  const [range, setRange] = useState("7d");
  const [analytics, setAnalytics] = useState({ openIncidents: 0, resolvedIncidents: 0, availableVolunteers: 0, shelters: 0, critical: 0, trends: [] as Array<{ date: string; total: number; critical: number }> });

  useEffect(() => {
    adminService.getAnalytics({ range }).then((response) => setAnalytics(response.data.data)).catch(() => toast.error("Analytics refresh failed"));
  }, [range]);

  const exportReport = (format: "csv" | "pdf") => {
    const content = format === "csv"
      ? `metric,value\nopenIncidents,${analytics.openIncidents}\nresolvedIncidents,${analytics.resolvedIncidents}\nvolunteers,${analytics.availableVolunteers}\nshelters,${analytics.shelters}\ncritical,${analytics.critical}\n`
      : `DisasterLink Operational Snapshot\nRange: ${range}\nOpen incidents: ${analytics.openIncidents}\nResolved: ${analytics.resolvedIncidents}`;
    const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `disasterlink-report.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-display-lg text-primary">Operational Analytics</h1><p className="text-body-base text-on-surface-variant">Performance metrics, response efficiency, and resource utilization dashboards.</p></div>
        <div className="flex gap-2">
          <select value={range} onChange={(e) => setRange(e.target.value)} className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-sm outline-none focus:border-primary"><option value="7d">Last 7 Days</option><option value="30d">Last 30 Days</option><option value="90d">Last Quarter</option></select>
          <button onClick={() => exportReport("csv")} className="bg-surface border border-outline-variant px-3 py-2 rounded-lg text-label-caps text-on-surface-variant hover:bg-surface-container-high flex items-center gap-1"><span className="material-symbols-outlined text-sm">download</span>CSV</button>
          <button onClick={() => exportReport("pdf")} className="bg-surface border border-outline-variant px-3 py-2 rounded-lg text-label-caps text-on-surface-variant hover:bg-surface-container-high flex items-center gap-1"><span className="material-symbols-outlined text-sm">picture_as_pdf</span>PDF</button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Open Incidents", value: String(analytics.openIncidents), change: "live", positive: false },
          { label: "Incidents Resolved", value: String(analytics.resolvedIncidents), change: "live", positive: true },
          { label: "Available Volunteers", value: String(analytics.availableVolunteers), change: "live", positive: true },
          { label: "Critical Events", value: String(analytics.critical), change: "live", positive: false },
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
            {(analytics.trends.length ? analytics.trends : [{ total: 1 }, { total: 3 }, { total: 2 }]).map((point, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors" style={{ height: `${Math.max(8, (point.total / Math.max(1, analytics.openIncidents + analytics.resolvedIncidents)) * 100)}%` }} />
                <span className="text-[9px] text-on-surface-variant font-mono">{("date" in point ? point.date.slice(5) : String(i + 1))}</span>
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
                { region: "Konkan Coastal", incidents: 8, response: "12 min", score: "A" },
                { region: "Mumbai Metro", incidents: 4, response: "18 min", score: "B+" },
                { region: "Western Ghats", incidents: 3, response: "22 min", score: "B" },
                { region: "Pune Industrial", incidents: 2, response: "9 min", score: "A+" },
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
