"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [role, setRole] = useState("volunteer");

  return (
    <main className="min-h-screen bg-background text-on-background flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-start py-8 px-4">
        <div className="w-full max-w-4xl space-y-8">
          {/* Progress Indicator */}
          <div className="w-full">
            <div className="flex justify-between items-end mb-2">
              <span className="text-label-caps text-primary">Mission Step 02 of 04</span>
              <span className="text-label-caps text-on-surface-variant uppercase">Identity Verification</span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary w-1/2" />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-body-sm text-on-surface-variant">Role Selection</span>
              <span className="text-body-sm text-primary font-bold">Personal Data</span>
              <span className="text-body-sm text-outline">Contact Details</span>
              <span className="text-body-sm text-outline">Verification</span>
            </div>
          </div>

          {/* Bento Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="border-l-4 border-primary pl-4 py-1">
                <h1 className="text-headline-md text-on-surface">Personnel Registration</h1>
                <p className="text-body-base text-on-surface-variant">Complete your profile to enable rapid deployment during critical incidents.</p>
              </div>

              {/* Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="role" type="radio" checked={role === "volunteer"} onChange={() => setRole("volunteer")} />
                  <div className="p-6 border border-outline-variant bg-surface rounded-xl peer-checked:border-primary peer-checked:bg-secondary-container transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${role === "volunteer" ? "border-primary bg-primary" : "border-outline-variant"}`} />
                    </div>
                    <h3 className="text-title-sm text-on-surface">Active Volunteer</h3>
                    <p className="text-body-sm text-on-surface-variant">Register to assist in field operations, shelter management, or logistics support.</p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="role" type="radio" checked={role === "citizen"} onChange={() => setRole("citizen")} />
                  <div className="p-6 border border-outline-variant bg-surface rounded-xl peer-checked:border-primary peer-checked:bg-secondary-container transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="material-symbols-outlined text-primary text-3xl">person_pin_circle</span>
                      <div className={`w-4 h-4 rounded-full border-2 ${role === "citizen" ? "border-primary bg-primary" : "border-outline-variant"}`} />
                    </div>
                    <h3 className="text-title-sm text-on-surface">Citizen Member</h3>
                    <p className="text-body-sm text-on-surface-variant">Receive localized alerts, emergency instructions, and safety status requests.</p>
                  </div>
                </label>
              </div>

              {/* Form Fields */}
              <div className="bg-surface border border-outline-variant p-6 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Legal First Name</label><input className="w-full p-4 border border-outline-variant rounded-lg focus:ring-0 focus:border-primary bg-surface-container-lowest text-body-base" placeholder="John" type="text"/></div>
                  <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Legal Last Name</label><input className="w-full p-4 border border-outline-variant rounded-lg focus:ring-0 focus:border-primary bg-surface-container-lowest text-body-base" placeholder="Doe" type="text"/></div>
                </div>
                <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Email Address (Government/Agency Preferred)</label><input className="w-full p-4 border border-outline-variant rounded-lg focus:ring-0 focus:border-primary bg-surface-container-lowest text-body-base" placeholder="j.doe@agency.gov" type="email"/></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Contact Number</label><input className="w-full p-4 border border-outline-variant rounded-lg focus:ring-0 focus:border-primary bg-surface-container-lowest text-body-base" placeholder="+1 (555) 000-0000" type="tel"/><p className="text-body-sm text-outline">Used for critical SMS alerts only.</p></div>
                  <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Date of Birth</label><input className="w-full p-4 border border-outline-variant rounded-lg focus:ring-0 focus:border-primary bg-surface-container-lowest text-body-base" type="date"/></div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-error">contact_emergency</span>
                  <h2 className="text-title-sm text-on-surface">Emergency Contact Protocol</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Contact Name</label><input className="w-full p-4 border border-outline-variant rounded-lg focus:ring-0 focus:border-primary bg-surface-container-lowest text-body-base" placeholder="Full Name" type="text"/></div>
                  <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Relationship</label>
                    <select className="w-full p-4 border border-outline-variant rounded-lg focus:ring-0 focus:border-primary bg-surface-container-lowest text-body-base">
                      <option>Spouse / Partner</option><option>Parent / Guardian</option><option>Sibling</option><option>Professional Peer</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-primary text-on-primary p-6 rounded-xl shadow-md">
                <span className="material-symbols-outlined mb-4 text-4xl block">security</span>
                <h3 className="text-title-sm mb-2">Secure Data Standard</h3>
                <p className="text-body-sm opacity-90">All registration data is encrypted using FIPS 140-2 standards. Your location and contact information is only visible to verified agency command staff during active emergency declarations.</p>
              </div>
              <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
                <div className="h-32 w-full bg-gradient-to-br from-primary/20 via-surface-dim to-surface-container-highest" />
                <div className="p-4">
                  <h4 className="text-label-caps text-on-surface mb-1">Active Response Regions</h4>
                  <p className="text-body-sm text-on-surface-variant">Registering allows you to be mapped in our real-time geospatial grid for immediate assistance.</p>
                </div>
              </div>
              <div className="p-6 bg-surface-container-highest rounded-xl border border-outline-variant">
                <h4 className="text-label-caps text-on-surface-variant mb-4">Quick Navigation</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-body-sm text-primary hover:underline cursor-pointer"><span className="material-symbols-outlined text-sm">help</span>Need help with the form?</li>
                  <li className="flex items-center gap-2 text-body-sm text-primary hover:underline cursor-pointer"><span className="material-symbols-outlined text-sm">description</span>Privacy Policy &amp; Data Usage</li>
                  <li className="flex items-center gap-2 text-body-sm text-primary hover:underline cursor-pointer"><span className="material-symbols-outlined text-sm">verified_user</span>Professional Certifications</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant gap-4">
            <Link href="/login" className="px-8 py-4 border border-outline text-on-surface hover:bg-surface-container-high transition-colors font-semibold rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined">arrow_back</span>Previous Step
            </Link>
            <div className="flex gap-4">
              <button className="px-8 py-4 text-on-surface hover:text-primary transition-colors font-semibold">Save Draft</button>
              <Link href="/verify" className="px-8 py-4 bg-primary text-on-primary hover:opacity-90 transition-opacity font-semibold rounded-lg shadow-sm flex items-center gap-2">
                Continue Registration<span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
