"use client";

import Link from "next/link";

export default function CitizenDashboard() {
  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      {/* Emergency SOS Section */}
      <section className="mb-8">
        <div className="bg-error-container p-6 rounded-xl border-2 border-error flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-display-lg text-on-error-container mb-1">Emergency Assistance</h1>
            <p className="text-body-base text-on-error-container opacity-90">Press and hold for 3 seconds to broadcast your GPS location to rescuers.</p>
          </div>
          <Link href="/dashboard/sos" className="w-full md:w-auto px-8 py-4 bg-error text-on-error text-headline-md rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
            SEND SOS NOW
          </Link>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Alerts + Shelters */}
        <div className="md:col-span-8 space-y-4">
          {/* Active Alerts */}
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title-sm flex items-center gap-1"><span className="material-symbols-outlined text-error">warning</span>Active Alerts (2)</h2>
              <span className="text-label-caps bg-error-container text-on-error-container px-2 py-1 rounded">CRITICAL</span>
            </div>
            <div className="space-y-2">
              <div className="p-4 bg-surface-container-low border-l-4 border-error rounded-lg">
                <p className="text-label-caps text-on-surface-variant mb-1">ISSUED 12 MINS AGO</p>
                <p className="text-title-sm text-on-surface">Flash Flood Warning: Downtown Area</p>
                <p className="text-body-sm text-on-surface-variant">Seek higher ground immediately. Avoid low-lying crossings.</p>
              </div>
              <div className="p-4 bg-surface-container-low border-l-4 border-tertiary rounded-lg">
                <p className="text-label-caps text-on-surface-variant mb-1">ISSUED 1 HOUR AGO</p>
                <p className="text-title-sm text-on-surface">Power Outage Scheduled: North Sector</p>
                <p className="text-body-sm text-on-surface-variant">Grid maintenance from 14:00 - 16:00 UTC.</p>
              </div>
            </div>
          </div>

          {/* Nearby Shelters */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-title-sm flex items-center gap-1"><span className="material-symbols-outlined text-primary">home_pin</span>Nearby Shelters</h2>
              <Link href="/dashboard/map" className="text-label-caps text-primary hover:underline">VIEW MAP</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-outline-variant">
              <div className="bg-surface-container-lowest p-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                <p className="text-title-sm">St. Mary&apos;s Community Center</p>
                <div className="flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-body-sm">near_me</span><p className="text-body-sm text-on-surface-variant">0.8 miles away</p></div>
                <div className="mt-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary" /><p className="text-label-caps text-on-tertiary-container">Status: Limited Capacity</p></div>
              </div>
              <div className="bg-surface-container-lowest p-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                <p className="text-title-sm">North District Arena</p>
                <div className="flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-body-sm">near_me</span><p className="text-body-sm text-on-surface-variant">2.4 miles away</p></div>
                <div className="mt-2 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /><p className="text-label-caps text-on-primary-container">Status: Open</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tracking + Contacts */}
        <div className="md:col-span-4 space-y-4">
          {/* Request Tracking */}
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
            <h2 className="text-title-sm flex items-center gap-1 mb-4"><span className="material-symbols-outlined text-primary">local_shipping</span>Current Request</h2>
            <div className="relative pl-4 border-l-2 border-primary-container space-y-4">
              <div className="relative"><span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-primary rounded-full" /><p className="text-label-caps text-primary">COMPLETED</p><p className="text-body-sm font-bold">Request Logged</p></div>
              <div className="relative"><span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-primary rounded-full" /><p className="text-label-caps text-primary">IN TRANSIT</p><p className="text-body-sm font-bold">Water Delivery #882</p></div>
              <div className="relative opacity-40"><span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-outline-variant rounded-full" /><p className="text-label-caps">PENDING</p><p className="text-body-sm">Final Inspection</p></div>
            </div>
            <Link href="/dashboard/requests" className="w-full mt-6 py-2 border border-primary text-primary rounded-lg text-label-caps hover:bg-primary-container transition-colors block text-center">NEW REQUEST</Link>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-4 bg-surface-container-low border-b border-outline-variant">
              <h2 className="text-title-sm flex items-center gap-1"><span className="material-symbols-outlined text-secondary">contacts</span>Key Contacts</h2>
            </div>
            <div className="divide-y divide-outline-variant">
              <a className="flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors" href="tel:911">
                <div><p className="text-body-base font-bold">Universal Emergency</p><p className="text-mono-data text-error">911</p></div>
                <span className="material-symbols-outlined text-error">call</span>
              </a>
              <a className="flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors" href="tel:311">
                <div><p className="text-body-base font-bold">Local Relief Agency</p><p className="text-mono-data text-secondary">311</p></div>
                <span className="material-symbols-outlined text-secondary">call</span>
              </a>
              <div className="p-4">
                <p className="text-label-caps text-on-surface-variant mb-2">PERSONAL CONTACTS</p>
                <div className="flex items-center justify-between"><p className="text-body-base">Family Crisis Line</p><button className="text-primary material-symbols-outlined">edit</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-high p-6 rounded-xl flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-primary text-[48px] mb-4">medication</span>
          <p className="text-title-sm">Medical Help</p>
          <p className="text-body-sm text-on-surface-variant">Find the nearest triage or first-aid station.</p>
        </div>
        <div className="bg-surface-container-high p-6 rounded-xl flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-primary text-[48px] mb-4">water_drop</span>
          <p className="text-title-sm">Clean Water</p>
          <p className="text-body-sm text-on-surface-variant">Active distribution points for potable water.</p>
        </div>
        <div className="bg-surface-container-high p-6 rounded-xl flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-primary text-[48px] mb-4">volunteer_activism</span>
          <p className="text-title-sm">Offer Help</p>
          <p className="text-body-sm text-on-surface-variant">Register to assist with non-critical tasks.</p>
        </div>
      </section>

      {/* Status Badge */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-surface-container-highest border border-outline px-4 py-1 rounded-full flex items-center gap-1 shadow-md">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-label-caps">OPTIMIZED MODE ACTIVE</p>
        </div>
      </div>
    </main>
  );
}
