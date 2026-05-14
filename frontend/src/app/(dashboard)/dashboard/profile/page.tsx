"use client";

import { useState } from "react";
import { toast } from "sonner";
import { userService } from "@/services";
import { useAuthStore } from "@/store/auth-store";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await userService.updateProfile({
      name: data.get("name"),
      phone: data.get("phone"),
      district: data.get("district"),
      emergencyContacts: [{ name: data.get("contactName"), relationship: data.get("relationship") }],
      medicalInfo: { notes: data.get("medicalInfo") },
      preferences: { shelterUpdates: data.get("shelterUpdates") === "on", deliveryTracking: data.get("deliveryTracking") === "on" }
    });
    toast.success("Profile saved");
  };

  const deactivate = async () => {
    await userService.deactivate();
    await logout();
    toast.error("Account deactivated", { description: "Recovery can be requested through formal support." });
  };

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <form onSubmit={save}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Profile Info */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border-l-4 border-primary pl-4 py-1">
            <h1 className="text-headline-md text-on-surface">Citizen Profile</h1>
            <p className="text-body-base text-on-surface-variant">Manage your personal details and emergency preferences.</p>
          </div>

          {/* Personal Info */}
          <div className="bg-surface border border-outline-variant p-6 rounded-xl space-y-4">
            <h3 className="text-title-sm text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-primary">person</span>Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Full Name</label><input name="name" className="w-full p-4 border border-outline-variant rounded-lg focus:border-primary bg-surface-container-lowest text-body-base outline-none" defaultValue={user?.name || "Citizen John Doe"} type="text"/></div>
              <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Agency Email</label><input className="w-full p-4 border border-outline-variant rounded-lg bg-surface-container-low text-body-base outline-none" defaultValue={user?.email || "j.doe@citizen.gov"} readOnly type="email"/></div>
              <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Phone Number</label><input name="phone" className="w-full p-4 border border-outline-variant rounded-lg focus:border-primary bg-surface-container-lowest text-body-base outline-none" defaultValue={user?.phone || "+91 98765 43210"} type="tel"/></div>
              <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Registered District</label><input name="district" className="w-full p-4 border border-outline-variant rounded-lg focus:border-primary bg-surface-container-lowest text-body-base outline-none" defaultValue={user?.district || "Konkan Coastal District"} type="text"/></div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-4"><span className="material-symbols-outlined text-error">contact_emergency</span><h3 className="text-title-sm text-on-surface">Emergency Contact</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Contact Name</label><input name="contactName" className="w-full p-4 border border-outline-variant rounded-lg focus:border-primary bg-surface-container-lowest text-body-base outline-none" defaultValue="Priya Sharma" type="text"/></div>
              <div className="flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Relationship</label><select name="relationship" className="w-full p-4 border border-outline-variant rounded-lg focus:border-primary bg-surface-container-lowest text-body-base outline-none"><option>Spouse / Partner</option><option>Parent / Guardian</option></select></div>
              <div className="md:col-span-2 flex flex-col gap-1"><label className="text-label-caps text-on-surface-variant">Medical Notes</label><textarea name="medicalInfo" className="w-full p-4 border border-outline-variant rounded-lg focus:border-primary bg-surface-container-lowest text-body-base outline-none" placeholder="Allergies, medication, mobility needs" /></div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-surface border border-outline-variant p-6 rounded-xl">
            <h3 className="text-title-sm text-on-surface mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">notifications</span>Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { label: "Critical Alerts (Mandatory)", desc: "Evacuations, severe weather, and immediate threats.", locked: true },
                { label: "Shelter Updates", desc: "Capacity changes and new shelter openings." },
                { label: "Supply Delivery Tracking", desc: "Status updates on your relief requests." },
              ].map((pref) => (
                <label key={pref.label} className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors">
                  <input name={pref.label.startsWith("Shelter") ? "shelterUpdates" : pref.label.startsWith("Supply") ? "deliveryTracking" : "criticalAlerts"} type="checkbox" defaultChecked className={`mt-1 w-5 h-5 rounded ${pref.locked ? "accent-error" : "accent-primary"}`} disabled={pref.locked} />
                  <div><p className="text-body-base font-bold">{pref.label}</p><p className="text-body-sm text-on-surface-variant">{pref.desc}</p></div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end"><button className="bg-primary text-on-primary px-8 py-4 rounded-lg text-label-caps font-bold hover:opacity-90 transition-opacity flex items-center gap-2"><span className="material-symbols-outlined">save</span>Save Changes</button></div>
        </div>

        {/* Right: Status Cards */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-primary text-on-primary p-6 rounded-xl">
            <span className="material-symbols-outlined text-4xl mb-4 block">verified_user</span>
            <h3 className="text-title-sm mb-2">Account Verified</h3>
            <p className="text-body-sm opacity-90">Your identity has been confirmed through the National Emergency Registry. Last verified: May 10, 2024.</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
            <h3 className="text-title-sm mb-4">Activity Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-body-sm text-on-surface-variant">Total Requests</span><span className="text-headline-md font-mono text-primary">12</span></div>
              <div className="flex justify-between items-center"><span className="text-body-sm text-on-surface-variant">SOS Activations</span><span className="text-headline-md font-mono text-error">0</span></div>
              <div className="flex justify-between items-center"><span className="text-body-sm text-on-surface-variant">Volunteer Hours</span><span className="text-headline-md font-mono text-tertiary">24</span></div>
            </div>
          </div>
          <div className="bg-error-container border border-error p-6 rounded-xl">
            <h3 className="text-title-sm text-on-error-container mb-2 flex items-center gap-2"><span className="material-symbols-outlined">warning</span>Danger Zone</h3>
            <p className="text-body-sm text-on-error-container mb-4">Deactivating your account will remove you from emergency notification lists.</p>
            <button type="button" onClick={() => setConfirmDeactivate(true)} className="w-full py-3 border border-error text-error rounded-lg text-label-caps hover:bg-error hover:text-on-error transition-colors">Deactivate Account</button>
          </div>
        </div>
      </div>
      </form>
      {confirmDeactivate && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 max-w-md space-y-4">
            <h2 className="text-title-sm text-error">Confirm Deactivation</h2>
            <p className="text-body-sm text-on-surface-variant">Your account will be soft-deleted and removed from active emergency notifications. Recovery remains available through support.</p>
            <div className="flex gap-2 justify-end"><button onClick={() => setConfirmDeactivate(false)} className="px-4 py-2 border border-outline-variant rounded">Cancel</button><button onClick={deactivate} className="px-4 py-2 bg-error text-on-error rounded">Deactivate</button></div>
          </div>
        </div>
      )}
    </main>
  );
}
