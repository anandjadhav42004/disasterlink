"use client";

import Link from "next/link";

export default function VolunteerTasksPage() {
  const tasks = [
    { id: "TSK-401", title: "Water Distribution: Sector C", priority: "HIGH", priorityBg: "bg-error-container text-on-error-container", status: "In Progress", statusBg: "bg-primary text-on-primary", location: "North Community Center", assigned: "Team Alpha", due: "Today, 14:00", desc: "Distribute 500 water bottles to affected families in Zone C-3." },
    { id: "TSK-398", title: "Shelter Setup: Arena B", priority: "MEDIUM", priorityBg: "bg-tertiary-container text-on-tertiary-container", status: "Pending", statusBg: "bg-tertiary-container text-on-tertiary-container", location: "District Arena, Block 4", assigned: "You + 3 others", due: "Today, 18:00", desc: "Set up 200 cots and organize intake station at the arena." },
    { id: "TSK-395", title: "Supply Inventory Check", priority: "LOW", priorityBg: "bg-surface-container-high text-on-surface-variant", status: "Queued", statusBg: "bg-surface-container-high text-on-surface-variant", location: "Central Warehouse", assigned: "Solo", due: "Tomorrow, 08:00", desc: "Complete physical count of all emergency supply categories." },
    { id: "TSK-390", title: "First Aid Station Coverage", priority: "MEDIUM", priorityBg: "bg-tertiary-container text-on-tertiary-container", status: "Completed", statusBg: "bg-surface-container-high text-outline", location: "St. Mary's Center", assigned: "Med Team", due: "Yesterday", desc: "12-hour shift at primary first aid station." },
  ];

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-display-lg text-primary">Task Assignments</h1><p className="text-body-base text-on-surface-variant">View and manage your current field operation tasks.</p></div>
        <button className="bg-primary text-on-primary px-6 py-3 rounded-lg text-label-caps hover:opacity-90 transition-opacity flex items-center gap-2"><span className="material-symbols-outlined">add_task</span>REQUEST TASK</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">TOTAL TASKS</p><p className="text-headline-md font-mono text-primary">8</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">IN PROGRESS</p><p className="text-headline-md font-mono text-primary">1</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">PENDING</p><p className="text-headline-md font-mono text-tertiary">2</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">COMPLETED</p><p className="text-headline-md font-mono text-outline">5</p></div>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {tasks.map((t) => (
          <div key={t.id} className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow ${t.status === "Completed" ? "opacity-60" : ""}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className={`${t.priorityBg} text-label-caps px-2 py-1 rounded`}>{t.priority}</span>
                <span className={`${t.statusBg} text-label-caps px-2 py-1 rounded`}>{t.status}</span>
                <span className="text-mono-data text-on-surface-variant">{t.id}</span>
              </div>
              <span className="text-mono-data text-on-surface-variant">{t.due}</span>
            </div>
            <h3 className="text-title-sm text-on-surface mb-1">{t.title}</h3>
            <p className="text-body-sm text-on-surface-variant mb-3">{t.desc}</p>
            <div className="flex items-center gap-6 text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{t.location}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">group</span>{t.assigned}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6"><Link href="/volunteer" className="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 text-body-sm"><span className="material-symbols-outlined text-sm">arrow_back</span>Back to Volunteer Hub</Link></div>
    </main>
  );
}
