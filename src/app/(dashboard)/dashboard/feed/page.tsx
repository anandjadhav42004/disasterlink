"use client";

export default function EmergencyFeedPage() {
  const feedItems = [
    { id: "FD-9012", time: "2 mins ago", type: "CRITICAL", title: "Flash Flood Warning Extended", desc: "Central and Southern districts now under severe flooding advisory. All residents must evacuate low-lying areas.", icon: "water_damage", borderColor: "border-error", badgeBg: "bg-error text-on-error" },
    { id: "FD-9011", time: "18 mins ago", type: "WARNING", title: "Road Closure: Highway 12 North", desc: "Debris blocking northbound lanes. Emergency crews clearing. Estimated reopening: 16:00 UTC.", icon: "traffic", borderColor: "border-tertiary", badgeBg: "bg-tertiary-container text-on-tertiary-container" },
    { id: "FD-9010", time: "45 mins ago", type: "INFO", title: "Shelter Capacity Update", desc: "North District Arena now operating at 60% capacity. Additional supplies delivered.", icon: "home_pin", borderColor: "border-primary", badgeBg: "bg-primary-container/20 text-primary" },
    { id: "FD-9009", time: "1 hour ago", type: "RESOLVED", title: "Gas Leak: Industrial Zone B", desc: "Containment confirmed. Air quality readings normal. All-clear issued for surrounding blocks.", icon: "verified", borderColor: "border-outline", badgeBg: "bg-surface-container-high text-on-surface-variant" },
  ];

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-display-lg text-primary">Emergency Feed</h1>
          <p className="text-body-base text-on-surface-variant">Real-time incident updates for your registered district.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface border border-outline-variant px-4 py-2 rounded-lg text-label-caps text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-sm">filter_list</span>FILTER</button>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-caps hover:opacity-90 transition-opacity flex items-center gap-1"><span className="material-symbols-outlined text-sm">notifications_active</span>SUBSCRIBE</button>
        </div>
      </div>

      {/* Live Status Bar */}
      <div className="bg-surface-container-high border border-outline-variant rounded-lg p-3 mb-6 flex items-center gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 pr-4 border-r border-outline-variant"><span className="w-2 h-2 bg-error rounded-full animate-pulse" /><span className="text-label-caps text-on-surface-variant">LIVE</span></div>
        <span className="text-body-sm text-on-surface-variant whitespace-nowrap">Active Incidents: <strong className="text-error">3</strong></span>
        <span className="text-body-sm text-on-surface-variant whitespace-nowrap">Evacuations: <strong className="text-tertiary">1 Zone</strong></span>
        <span className="text-body-sm text-on-surface-variant whitespace-nowrap">Last Sync: <strong className="text-mono-data">14:02 UTC</strong></span>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {feedItems.map((item) => (
          <div key={item.id} className={`bg-surface-container-lowest border-l-4 ${item.borderColor} border-y border-r border-outline-variant rounded-lg p-6 hover:shadow-md transition-shadow`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className={`${item.badgeBg} text-label-caps px-3 py-1 rounded`}>{item.type}</span>
                <span className="text-mono-data text-on-surface-variant">{item.id}</span>
              </div>
              <span className="text-on-surface-variant text-mono-data">{item.time}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">{item.icon}</span>
              <div>
                <h3 className="text-title-sm text-on-surface mb-1">{item.title}</h3>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="border border-outline text-on-surface-variant px-8 py-3 rounded-lg text-label-caps hover:bg-surface-container-high transition-colors">LOAD OLDER EVENTS</button>
      </div>
    </main>
  );
}
