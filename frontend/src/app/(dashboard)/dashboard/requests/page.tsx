"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { requestService } from "@/services";

export default function RequestsPage() {
  const requests = [
    { id: "#882", type: "Water Delivery", status: "In Transit", statusColor: "bg-primary text-on-primary", date: "Today, 13:20", eta: "~45 min" },
    { id: "#879", type: "Medical Supplies", status: "Delivered", statusColor: "bg-surface-container-high text-on-surface-variant", date: "Yesterday, 09:15", eta: "—" },
    { id: "#871", type: "Emergency Shelter Kit", status: "Processing", statusColor: "bg-tertiary-container text-on-tertiary-container", date: "May 10, 08:30", eta: "~2 hrs" },
  ];
  const [items, setItems] = useState(requests);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ type: "food", description: "", latitude: "19.076", longitude: "72.8777", severity: "MEDIUM" });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await requestService.create({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) });
      setItems((prev) => [{ id: response.data.data.id.slice(0, 8), type: form.type, status: "Submitted", statusColor: "bg-primary text-on-primary", date: "Just now", eta: "Assigning" }, ...prev]);
      toast.success("Request submitted", { description: "Admins and nearby responders were notified." });
      setShowNew(false);
    } catch {
      toast.error("Request failed");
    }
  };

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-display-lg text-primary">My Requests</h1><p className="text-body-base text-on-surface-variant">Track your relief aid requests and delivery status.</p></div>
        <button onClick={() => setShowNew(true)} className="bg-primary text-on-primary px-6 py-3 rounded-lg text-label-caps hover:opacity-90 transition-opacity flex items-center gap-2"><span className="material-symbols-outlined">add</span>NEW REQUEST</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">TOTAL REQUESTS</p><p className="text-headline-md text-primary font-mono">12</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">IN PROGRESS</p><p className="text-headline-md text-tertiary font-mono">2</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">DELIVERED</p><p className="text-headline-md text-primary font-mono">10</p></div>
      </div>

      {/* Request Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container-high border-b border-outline-variant">
            <tr>{["REQUEST ID", "TYPE", "STATUS", "DATE", "ETA"].map((h) => <th key={h} className="px-4 py-3 text-label-caps text-on-surface-variant">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-4 py-3 text-mono-data text-primary font-bold">{r.id}</td>
                <td className="px-4 py-3 text-body-base">{r.type}</td>
                <td className="px-4 py-3"><span className={`${r.statusColor} text-label-caps px-2 py-1 rounded`}>{r.status}</span></td>
                <td className="px-4 py-3 text-body-sm text-on-surface-variant">{r.date}</td>
                <td className="px-4 py-3 text-mono-data">{r.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6"><Link href="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 text-body-sm"><span className="material-symbols-outlined text-sm">arrow_back</span>Back to Dashboard</Link></div>
      {showNew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between"><h2 className="text-title-sm">New Relief Request</h2><button type="button" onClick={() => setShowNew(false)} className="material-symbols-outlined">close</button></div>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full p-3 rounded-lg border border-outline-variant bg-surface"><option value="food">Food Request</option><option value="medical">Medical Request</option><option value="evacuation">Evacuation Request</option><option value="rescue">Rescue Request</option></select>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-3 rounded-lg border border-outline-variant bg-surface min-h-24" placeholder="Describe what you need and how many people are affected" />
            <div className="grid grid-cols-3 gap-3">
              <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Latitude" />
              <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Longitude" />
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface"><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select>
            </div>
            <button className="w-full bg-primary text-on-primary py-3 rounded-lg text-label-caps">Submit Request</button>
          </form>
        </div>
      )}
    </main>
  );
}
