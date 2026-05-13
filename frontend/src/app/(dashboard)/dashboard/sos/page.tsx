"use client";

import Link from "next/link";
import { useState } from "react";

export default function SOSPage() {
  const [isHolding, setIsHolding] = useState(false);

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main SOS Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border-l-4 border-error pl-4 py-1">
            <h1 className="text-display-lg text-error">Emergency SOS Beacon</h1>
            <p className="text-body-base text-on-surface-variant">Activating this will broadcast your exact GPS coordinates and emergency profile to all nearby rescue teams and your registered contacts.</p>
          </div>

          {/* SOS Button Area */}
          <div className="bg-surface-container-lowest border-2 border-error rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <button
              onMouseDown={() => setIsHolding(true)}
              onMouseUp={() => setIsHolding(false)}
              onMouseLeave={() => setIsHolding(false)}
              className={`w-48 h-48 rounded-full bg-error text-on-error shadow-2xl flex flex-col items-center justify-center gap-2 transition-all ${isHolding ? "scale-95 ring-8 ring-error/30" : "hover:scale-105 animate-pulse-slow"}`}
            >
              <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
              <span className="text-label-caps">HOLD 3 SEC</span>
            </button>
            <p className="text-body-sm text-on-surface-variant mt-6 max-w-sm">Press and hold the SOS button for 3 seconds to activate the emergency broadcast. This action cannot be undone for 60 seconds.</p>
          </div>

          {/* Location Confirmation */}
          <div className="bg-surface border border-outline-variant p-6 rounded-xl">
            <h3 className="text-title-sm text-on-surface flex items-center gap-2 mb-4"><span className="material-symbols-outlined text-primary">my_location</span>Your Current Location</h3>
            <div className="bg-surface-dim h-48 rounded-lg overflow-hidden relative border border-outline-variant">
              <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(#6750a4 0.5px, transparent 0.5px)", backgroundSize: "24px 24px", opacity: 0.1 }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><div className="w-6 h-6 bg-error rounded-full animate-ping opacity-50" /><div className="w-4 h-4 bg-error rounded-full absolute top-1 left-1" /></div>
              <div className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur px-3 py-1 rounded border border-outline-variant"><span className="text-mono-data text-body-sm">34.0522° N, 118.2437° W</span></div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-error-container border border-error p-6 rounded-xl">
            <span className="material-symbols-outlined text-error text-4xl mb-4 block">warning</span>
            <h3 className="text-title-sm text-on-error-container mb-2">Before You Activate</h3>
            <ul className="space-y-2 text-body-sm text-on-error-container">
              <li className="flex items-start gap-2"><span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>Ensure you are in a safe location</li>
              <li className="flex items-start gap-2"><span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>Your phone has sufficient battery</li>
              <li className="flex items-start gap-2"><span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>GPS location services are enabled</li>
              <li className="flex items-start gap-2"><span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>Emergency contacts are up to date</li>
            </ul>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
            <h3 className="text-title-sm text-on-surface mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-secondary">contacts</span>Emergency Contacts</h3>
            <div className="space-y-3 divide-y divide-outline-variant">
              <a href="tel:911" className="flex items-center justify-between py-2"><div><p className="font-bold">Universal Emergency</p><p className="text-mono-data text-error">911</p></div><span className="material-symbols-outlined text-error">call</span></a>
              <a href="tel:311" className="flex items-center justify-between py-2"><div><p className="font-bold">Local Relief Agency</p><p className="text-mono-data text-secondary">311</p></div><span className="material-symbols-outlined text-secondary">call</span></a>
            </div>
          </div>

          <Link href="/dashboard" className="w-full py-4 border border-outline text-on-surface rounded-lg text-label-caps hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">arrow_back</span>Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
