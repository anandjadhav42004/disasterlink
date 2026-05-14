"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useOperationsStore, type LiveShelter } from "@/store/operations-store";

export default function ShelterManagementPage() {
  const { shelters, fetchShelters, createShelter, updateShelter, deleteShelter } = useOperationsStore();
  const [showAdd, setShowAdd] = useState(false);
  const [managed, setManaged] = useState<LiveShelter | null>(null);
  const [filter, setFilter] = useState({ search: "", status: "all", district: "" });
  const [form, setForm] = useState({ name: "", address: "", contact: "", capacity: "100", occupied: "0", latitude: "19.076", longitude: "72.8777", district: "", state: "" });

  useEffect(() => {
    fetchShelters(filter);
  }, [fetchShelters, filter]);

  const totals = useMemo(() => {
    const capacity = shelters.reduce((sum, shelter) => sum + shelter.capacity, 0);
    const occupied = shelters.reduce((sum, shelter) => sum + shelter.occupied, 0);
    return { capacity, occupied, full: shelters.filter((shelter) => shelter.occupied >= shelter.capacity).length };
  }, [shelters]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createShelter({ ...form, capacity: Number(form.capacity), occupied: Number(form.occupied), latitude: Number(form.latitude), longitude: Number(form.longitude), status: "open" });
      toast.success("Shelter added");
      setShowAdd(false);
    } catch {
      toast.error("Could not add shelter");
    }
  };

  const updateOccupancy = async (shelter: LiveShelter, delta: number) => {
    const occupied = Math.max(0, Math.min(shelter.capacity, shelter.occupied + delta));
    await updateShelter(shelter.id, { occupied });
  };

  const getBarColor = (val: number) => val > 85 ? "bg-error" : val > 60 ? "bg-tertiary" : "bg-primary";

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-display-lg text-primary">Shelter Management</h1><p className="text-body-base text-on-surface-variant">CRUD, occupancy, resources, emergency capacity, and realtime shelter updates.</p></div>
        <button onClick={() => setShowAdd(true)} className="bg-primary text-on-primary px-6 py-3 rounded-lg text-label-caps hover:opacity-90 flex items-center gap-2"><span className="material-symbols-outlined">add_home</span>ADD SHELTER</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">TOTAL SHELTERS</p><p className="text-headline-md font-mono text-primary">{shelters.length}</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">TOTAL CAPACITY</p><p className="text-headline-md font-mono text-primary">{totals.capacity}</p></div>
        <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl"><p className="text-label-caps text-on-surface-variant">CURRENT OCCUPANCY</p><p className="text-headline-md font-mono text-tertiary">{totals.occupied}</p></div>
        <div className="bg-error-container border border-error p-4 rounded-xl"><p className="text-label-caps text-on-error-container">AT CAPACITY</p><p className="text-headline-md font-mono text-on-error-container">{totals.full}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
        <input value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Search shelters..." />
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface"><option value="all">All Status</option><option value="open">Open</option><option value="closed">Closed</option></select>
        <input value={filter.district} onChange={(e) => setFilter({ ...filter, district: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder="District" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shelters.map((s) => {
          const pct = s.capacity ? Math.round((s.occupied / s.capacity) * 100) : 0;
          return (
            <div key={s.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div><span className="text-mono-data text-on-surface-variant">{s.id.slice(0, 8)}</span><h3 className="text-title-sm text-on-surface">{s.name}</h3><p className="text-body-sm text-on-surface-variant">{s.address}</p></div>
                <span className={`${pct > 85 ? "bg-error-container text-on-error-container" : "bg-primary-container/20 text-primary"} text-label-caps px-2 py-0.5 rounded`}>{s.emergencyCapacity ? "EMERGENCY" : s.status || "OPEN"}</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-label-caps text-on-surface-variant mb-1"><span>OCCUPANCY</span><span>{pct}% ({s.occupied}/{s.capacity})</span></div>
                <div className="w-full bg-outline-variant h-2 rounded-full overflow-hidden"><div className={`${getBarColor(pct)} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} /></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{s.district || "Unassigned"}</span>
                <button onClick={() => setManaged(s)} className="text-label-caps text-primary hover:underline">MANAGE</button>
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between"><h2 className="text-title-sm">Add Shelter</h2><button type="button" onClick={() => setShowAdd(false)} className="material-symbols-outlined">close</button></div>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Shelter name" />
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Address" />
            <div className="grid grid-cols-2 gap-3">
              {(["capacity", "occupied", "latitude", "longitude", "district", "state", "contact"] as const).map((key) => (
                <input key={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="p-3 rounded-lg border border-outline-variant bg-surface" placeholder={key} />
              ))}
            </div>
            <button className="w-full bg-primary text-on-primary py-3 rounded-lg text-label-caps">Create Shelter</button>
          </form>
        </div>
      )}

      {managed && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between"><h2 className="text-title-sm">{managed.name}</h2><button type="button" onClick={() => setManaged(null)} className="material-symbols-outlined">close</button></div>
            <div className="flex gap-2">
              <button onClick={() => updateOccupancy(managed, -1)} className="px-4 py-2 rounded border border-outline-variant">- Occupancy</button>
              <button onClick={() => updateOccupancy(managed, 1)} className="px-4 py-2 rounded border border-outline-variant">+ Occupancy</button>
              <button onClick={async () => { await updateShelter(managed.id, { emergencyCapacity: !managed.emergencyCapacity }); setManaged({ ...managed, emergencyCapacity: !managed.emergencyCapacity }); }} className="px-4 py-2 rounded border border-primary text-primary">Emergency Capacity</button>
            </div>
            <textarea onBlur={(e) => updateShelter(managed.id, { resources: { notes: e.target.value } })} className="w-full p-3 rounded-lg border border-outline-variant bg-surface min-h-24" placeholder="Resource notes, stock, volunteer assignments" />
            <button onClick={async () => { await deleteShelter(managed.id); toast.success("Shelter removed"); setManaged(null); }} className="w-full bg-error text-on-error py-3 rounded-lg text-label-caps">Delete Shelter</button>
          </div>
        </div>
      )}

      <div className="mt-6"><Link href="/admin" className="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 text-body-sm"><span className="material-symbols-outlined text-sm">arrow_back</span>Back to Command</Link></div>
    </main>
  );
}
