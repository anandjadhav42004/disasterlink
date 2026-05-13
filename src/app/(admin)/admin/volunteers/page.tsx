"use client";

import Link from "next/link";

export default function VolunteersManagementPage() {
  const volunteers = [
    { id: "VOL-104", name: "Sarah Mitchell", role: "Field Ops Lead", status: "Deployed", statusBg: "bg-primary text-on-primary", zone: "Sector C", cert: "First Aid, HazMat L2", hours: 142 },
    { id: "VOL-089", name: "James Chen", role: "Medical Responder", status: "Deployed", statusBg: "bg-primary text-on-primary", zone: "Arena B", cert: "EMT-B, First Aid", hours: 98 },
    { id: "VOL-156", name: "Maria Rodriguez", role: "Logistics Coordinator", status: "Available", statusBg: "bg-tertiary-container text-on-tertiary-container", zone: "—", cert: "Supply Chain", hours: 67 },
    { id: "VOL-201", name: "David Okonkwo", role: "Communications", status: "Off Duty", statusBg: "bg-surface-container-high text-on-surface-variant", zone: "—", cert: "Radio Ops", hours: 34 },
  ];

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-display-lg text-primary">Volunteer Management</h1><p className="text-body-base text-on-surface-variant">Deploy, track, and manage volunteer personnel across all operational zones.</p></div>
        <button className="bg-primary text-on-primary px-6 py-3 rounded-lg text-label-caps hover:opacity-90 flex items-center gap-2"><span className="material-symbols-outlined">group_add</span>DEPLOY TEAM</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">TOTAL REGISTERED</p><p className="text-headline-md font-mono text-primary">342</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">DEPLOYED</p><p className="text-headline-md font-mono text-primary">87</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">AVAILABLE</p><p className="text-headline-md font-mono text-tertiary">124</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">OFF DUTY</p><p className="text-headline-md font-mono text-outline">131</p></div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant"><tr>{["ID", "NAME", "ROLE", "STATUS", "ZONE", "CERTIFICATIONS", "HOURS"].map((h) => <th key={h} className="px-4 py-3 text-label-caps text-on-surface-variant whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-outline-variant">
              {volunteers.map((v) => (
                <tr key={v.id} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-mono-data text-primary font-bold">{v.id}</td>
                  <td className="px-4 py-3 text-body-base font-bold">{v.name}</td>
                  <td className="px-4 py-3 text-body-sm">{v.role}</td>
                  <td className="px-4 py-3"><span className={`${v.statusBg} text-label-caps px-2 py-0.5 rounded`}>{v.status}</span></td>
                  <td className="px-4 py-3 text-body-sm">{v.zone}</td>
                  <td className="px-4 py-3 text-body-sm text-on-surface-variant">{v.cert}</td>
                  <td className="px-4 py-3 text-mono-data">{v.hours}</td>
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
