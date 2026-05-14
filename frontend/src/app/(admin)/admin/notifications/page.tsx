"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { adminService } from "@/services";

export default function NotificationsPage() {
  const broadcasts = [
    { id: "BC-401", title: "Evacuation Order: Konkan Coastal District", type: "EMERGENCY", typeBg: "bg-error text-on-error", sent: "2 min ago", reach: "12,842", channel: "SMS + Push + Radio" },
    { id: "BC-400", title: "Power Outage Advisory: North Mumbai Sector", type: "WARNING", typeBg: "bg-tertiary-container text-on-tertiary-container", sent: "1 hr ago", reach: "3,200", channel: "Push Notification" },
    { id: "BC-399", title: "Shelter Opening: Unity Plaza", type: "INFO", typeBg: "bg-primary-container/20 text-primary", sent: "3 hrs ago", reach: "8,500", channel: "Push + Email" },
  ];
  const [items, setItems] = useState(broadcasts);
  const [form, setForm] = useState({ title: "", message: "", severity: "HIGH", district: "", channels: "in-app,push,sms,email" });

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await adminService.broadcast({ ...form, channels: form.channels.split(",").map((item) => item.trim()) });
    setItems((prev) => [{ id: response.data.data.id.slice(0, 8), title: form.title || "Emergency broadcast", type: form.severity, typeBg: "bg-error text-on-error", sent: "Just now", reach: "Realtime", channel: form.channels }, ...prev]);
    toast.success("Broadcast sent", { description: "In-app, push, SMS, and email architecture queued." });
  };

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-display-lg text-primary">Alert Broadcasts</h1><p className="text-body-base text-on-surface-variant">Manage emergency notifications and public alert broadcasts.</p></div>
        <button className="bg-error text-on-error px-6 py-3 rounded-lg text-label-caps hover:opacity-90 flex items-center gap-2"><span className="material-symbols-outlined">campaign</span>NEW BROADCAST</button>
      </div>

      {/* Compose Area */}
      <form onSubmit={send} className="bg-surface border border-outline-variant rounded-xl p-6 mb-6">
        <h3 className="text-title-sm text-on-surface mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">edit_notifications</span>Quick Broadcast</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Severity</label><select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-base outline-none focus:border-primary"><option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div>
          <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Target Region</label><input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-base outline-none focus:border-primary" placeholder="All Districts" /></div>
          <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Channels</label><input value={form.channels} onChange={(e) => setForm({ ...form, channels: e.target.value })} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-base outline-none focus:border-primary" /></div>
        </div>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-base outline-none focus:border-primary mb-4" placeholder="Broadcast title" />
        <div className="flex flex-col gap-1 mb-4"><label className="text-label-caps text-on-surface-variant">Message</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-base outline-none focus:border-primary" rows={3} placeholder="Enter broadcast message..." /></div>
        <div className="flex justify-end"><button className="bg-error text-on-error px-6 py-3 rounded-lg text-label-caps hover:opacity-90 flex items-center gap-2"><span className="material-symbols-outlined">send</span>SEND BROADCAST</button></div>
      </form>

      {/* Broadcast History */}
      <h3 className="text-title-sm mb-4">Broadcast History</h3>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant"><tr>{["ID", "TITLE", "TYPE", "SENT", "REACH", "CHANNEL"].map((h) => <th key={h} className="px-4 py-3 text-label-caps text-on-surface-variant whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-outline-variant">
              {items.map((b) => (
                <tr key={b.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 text-mono-data text-primary font-bold">{b.id}</td>
                  <td className="px-4 py-3 text-body-base">{b.title}</td>
                  <td className="px-4 py-3"><span className={`${b.typeBg} text-label-caps px-2 py-0.5 rounded`}>{b.type}</span></td>
                  <td className="px-4 py-3 text-mono-data text-on-surface-variant">{b.sent}</td>
                  <td className="px-4 py-3 text-mono-data">{b.reach}</td>
                  <td className="px-4 py-3 text-body-sm text-on-surface-variant">{b.channel}</td>
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
