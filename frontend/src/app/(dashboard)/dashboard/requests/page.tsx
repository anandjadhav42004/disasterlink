"use client";

import Link from "next/link";

export default function RequestsPage() {
  const requests = [
    { id: "#882", type: "Water Delivery", status: "In Transit", statusColor: "bg-primary text-on-primary", date: "Today, 13:20", eta: "~45 min" },
    { id: "#879", type: "Medical Supplies", status: "Delivered", statusColor: "bg-surface-container-high text-on-surface-variant", date: "Yesterday, 09:15", eta: "—" },
    { id: "#871", type: "Emergency Shelter Kit", status: "Processing", statusColor: "bg-tertiary-container text-on-tertiary-container", date: "May 10, 08:30", eta: "~2 hrs" },
  ];

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-display-lg text-primary">My Requests</h1><p className="text-body-base text-on-surface-variant">Track your relief aid requests and delivery status.</p></div>
        <button className="bg-primary text-on-primary px-6 py-3 rounded-lg text-label-caps hover:opacity-90 transition-opacity flex items-center gap-2"><span className="material-symbols-outlined">add</span>NEW REQUEST</button>
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
            {requests.map((r) => (
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
    </main>
  );
}
