"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useOperationsStore } from "@/store/operations-store";

export default function IncidentsPage() {
  const { incidents, fetchIncidents, createIncident, updateIncident, isLoading } = useOperationsStore();
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ search: "", status: "all", severity: "all", district: "", from: "", to: "", sort: "createdAt", order: "desc" });
  const [form, setForm] = useState({ title: "", description: "", type: "FLOOD", severity: "HIGH", latitude: "19.076", longitude: "72.8777", district: "" });

  useEffect(() => {
    fetchIncidents(filters);
  }, [fetchIncidents, filters]);

  const counts = useMemo(() => ({
    total: incidents.length,
    critical: incidents.filter((item) => item.severity === "CRITICAL").length,
    high: incidents.filter((item) => item.severity === "HIGH").length,
    resolved: incidents.filter((item) => item.status === "RESOLVED").length,
  }), [incidents]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createIncident({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) });
      toast.success("Incident created");
      setShowCreate(false);
      setForm({ title: "", description: "", type: "FLOOD", severity: "HIGH", latitude: "19.076", longitude: "72.8777", district: "" });
    } catch {
      toast.error("Incident creation failed");
    }
  };

  const setStatus = async (id: string, status: string) => {
    await updateIncident(id, { status });
    toast.success("Incident updated", { description: status });
  };

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-display-lg text-primary">Incident Management</h1><p className="text-body-base text-on-surface-variant">Create, filter, sort, deploy, and resolve live emergency incidents.</p></div>
        <button onClick={() => setShowCreate(true)} className="bg-error text-on-error px-6 py-3 rounded-lg text-label-caps hover:opacity-90 flex items-center gap-2"><span className="material-symbols-outlined">add_circle</span>NEW INCIDENT</button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {[
          ["all", `All (${counts.total})`],
          ["CRITICAL", `Critical (${counts.critical})`],
          ["HIGH", `High (${counts.high})`],
          ["RESOLVED", `Resolved (${counts.resolved})`],
        ].map(([value, label]) => (
          <button key={value} onClick={() => value === "RESOLVED" ? setFilters({ ...filters, status: value, severity: "all" }) : setFilters({ ...filters, severity: value, status: "all" })} className="px-4 py-2 rounded-lg text-label-caps whitespace-nowrap bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-high">{label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
        <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="md:col-span-2 p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Live search incidents..." />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface"><option value="all">All Status</option><option>PENDING</option><option>ASSIGNED</option><option>IN_PROGRESS</option><option>RESOLVED</option><option>CANCELLED</option></select>
        <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface"><option value="all">All Severity</option><option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select>
        <input value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="District" />
        <select value={filters.order} onChange={(e) => setFilters({ ...filters, order: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface"><option value="desc">Newest first</option><option value="asc">Oldest first</option></select>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant"><tr>{["ID", "INCIDENT", "SEVERITY", "REGION", "STATUS", "VOLUNTEER", "UPDATED", "ACTIONS"].map((h) => <th key={h} className="px-4 py-3 text-label-caps text-on-surface-variant whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-outline-variant">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 text-mono-data text-primary font-bold">{inc.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-body-base">{inc.description || inc.type}</td>
                  <td className="px-4 py-3"><span className={`${inc.severity === "CRITICAL" ? "bg-error text-on-error" : inc.severity === "HIGH" ? "bg-tertiary-container text-on-tertiary-container" : "bg-surface-container-high text-on-surface-variant"} text-label-caps px-2 py-0.5 rounded`}>{inc.severity}</span></td>
                  <td className="px-4 py-3 text-body-sm">{inc.user?.district || "Unassigned"}</td>
                  <td className="px-4 py-3 text-body-sm font-bold">{inc.status}</td>
                  <td className="px-4 py-3 text-body-sm">{inc.volunteer?.user?.name || "Awaiting deployment"}</td>
                  <td className="px-4 py-3 text-mono-data text-on-surface-variant">{new Date(inc.updatedAt || inc.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <select value={inc.status} onChange={(e) => setStatus(inc.id, e.target.value)} className="p-2 rounded border border-outline-variant bg-surface text-body-sm">
                      <option>PENDING</option><option>ASSIGNED</option><option>IN_PROGRESS</option><option>RESOLVED</option><option>CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
              {!isLoading && incidents.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-on-surface-variant">No incidents match the current filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between"><h2 className="text-title-sm">Create Incident</h2><button type="button" onClick={() => setShowCreate(false)} className="material-symbols-outlined">close</button></div>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Incident title" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-3 rounded-lg border border-outline-variant bg-surface min-h-24" placeholder="Description and operational notes" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface"><option>FLOOD</option><option>FIRE</option><option>MEDICAL</option><option>EARTHQUAKE</option><option>OTHER</option></select>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface"><option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select>
              <input required value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Latitude" />
              <input required value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Longitude" />
              <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="col-span-2 p-3 rounded-lg border border-outline-variant bg-surface" placeholder="District" />
            </div>
            <button className="w-full bg-error text-on-error py-3 rounded-lg text-label-caps">Create and Broadcast</button>
          </form>
        </div>
      )}

      <div className="mt-6"><Link href="/admin" className="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 text-body-sm"><span className="material-symbols-outlined text-sm">arrow_back</span>Back to Command</Link></div>
    </main>
  );
}
