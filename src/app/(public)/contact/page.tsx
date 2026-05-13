"use client";

import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="max-w-[1440px] mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-display-lg text-primary mb-2">Contact Disaster Management</h1>
          <p className="text-body-base text-on-surface-variant max-w-2xl">Connect with the National Emergency Management Agency for operational coordination, NGO partnerships, and inter-agency collaboration.</p>
        </header>

        {/* Priority Contact Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-error-container border border-error p-6 rounded shadow-sm flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex items-center gap-2 mb-2 text-error">
                <span className="material-symbols-outlined">emergency</span>
                <span className="text-label-caps">Priority Hotline</span>
              </div>
              <h2 className="text-headline-md text-on-error-container">Incident Response</h2>
            </div>
            <div><span className="text-mono-data text-on-error-container text-xl font-bold">800-EMRG-OPS-01</span><br/><span className="text-body-sm text-on-error-container opacity-80">24/7 Verified Agency Line</span></div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded shadow-sm flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary">
                <span className="material-symbols-outlined">groups</span>
                <span className="text-label-caps">Logistics Support</span>
              </div>
              <h2 className="text-headline-md text-on-surface">NGO Partnerships</h2>
            </div>
            <div><span className="text-mono-data text-on-surface text-xl font-bold">800-DLNK-PARTNER</span><br/><span className="text-body-sm text-on-surface-variant">Mon-Fri | 0800 - 1800 EST</span></div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded shadow-sm flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary">
                <span className="material-symbols-outlined">account_balance</span>
                <span className="text-label-caps">G2G Portal</span>
              </div>
              <h2 className="text-headline-md text-on-surface">Gov-to-Gov Liaison</h2>
            </div>
            <div><span className="text-mono-data text-on-surface text-xl font-bold">agency-hq@dlink.gov</span><br/><span className="text-body-sm text-on-surface-variant">Secure Federal Channel</span></div>
          </div>
        </section>

        {/* Form + Sidebar */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-7 bg-surface border border-outline-variant rounded-xl p-8">
            <h3 className="text-headline-md text-primary mb-4">Operational Inquiry Form</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-caps text-on-surface-variant">Agency Name</label>
                  <input className="bg-surface-container-low border border-outline-variant focus:border-primary rounded px-4 py-2 text-body-base outline-none transition-colors" placeholder="e.g., Red Cross International" type="text"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-caps text-on-surface-variant">Contact Person</label>
                  <input className="bg-surface-container-low border border-outline-variant focus:border-primary rounded px-4 py-2 text-body-base outline-none transition-colors" placeholder="Full legal name" type="text"/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-label-caps text-on-surface-variant">Official Email</label>
                  <input className="bg-surface-container-low border border-outline-variant focus:border-primary rounded px-4 py-2 text-body-base outline-none transition-colors" placeholder="user@agency.gov" type="email"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-caps text-on-surface-variant">Inquiry Type</label>
                  <select className="bg-surface-container-low border border-outline-variant focus:border-primary rounded px-4 py-2 text-body-base outline-none transition-colors">
                    <option>Asset Deployment Request</option>
                    <option>Data Sharing Agreement</option>
                    <option>Joint Training Exercise</option>
                    <option>Grant/NGO Funding Inquiry</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label-caps text-on-surface-variant">Detailed Message</label>
                <textarea className="bg-surface-container-low border border-outline-variant focus:border-primary rounded px-4 py-2 text-body-base outline-none transition-colors" placeholder="Describe the operational requirement..." rows={5}/>
              </div>
              <div className="flex justify-end mt-4">
                <button className="bg-primary text-on-primary font-bold px-8 py-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity" type="submit">Submit Formal Inquiry <span className="material-symbols-outlined">send</span></button>
              </div>
            </form>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container-high rounded-xl p-8 flex flex-col justify-between flex-1 border border-outline-variant">
              <div>
                <h3 className="text-title-sm text-on-surface mb-2">NGO &amp; Partner Resource Hub</h3>
                <p className="text-body-sm text-on-surface-variant mb-4">Access technical documentation, API integration guides, and volunteer mobilization protocols.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-body-base"><span className="material-symbols-outlined text-primary">description</span>Deployment Handbook 2024</li>
                  <li className="flex items-center gap-2 text-body-base"><span className="material-symbols-outlined text-primary">api</span>Real-time Data Feed Specs</li>
                  <li className="flex items-center gap-2 text-body-base"><span className="material-symbols-outlined text-primary">verified_user</span>Accreditation Portal</li>
                </ul>
              </div>
              <button className="w-full border-2 border-primary text-primary font-bold py-4 rounded-lg hover:bg-primary-container/10 transition-colors">View Partner Portal</button>
            </div>
            <div className="relative rounded-xl overflow-hidden h-64 border border-outline-variant">
              <div className="w-full h-full bg-gradient-to-br from-primary-container/60 via-surface-dim to-inverse-surface"/>
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <span className="text-label-caps text-tertiary-fixed mb-1">Global HQ</span>
                <h4 className="text-title-sm">Arlington Strategic Operations</h4>
                <p className="text-body-sm opacity-80">1500 Operations Plaza, Suite 400</p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Grid */}
        <section className="bg-surface-container-low border border-outline-variant rounded-xl p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center md:text-left"><span className="material-symbols-outlined text-primary text-4xl mb-2 block">support_agent</span><h5 className="font-bold text-on-surface">Tech Support</h5><p className="text-body-sm text-on-surface-variant">Interface issues and system access troubleshooting.</p></div>
          <div className="text-center md:text-left"><span className="material-symbols-outlined text-primary text-4xl mb-2 block">map</span><h5 className="font-bold text-on-surface">GIS Services</h5><p className="text-body-sm text-on-surface-variant">Request specific geospatial data and incident layers.</p></div>
          <div className="text-center md:text-left"><span className="material-symbols-outlined text-primary text-4xl mb-2 block">news</span><h5 className="font-bold text-on-surface">Media Relations</h5><p className="text-body-sm text-on-surface-variant">Press inquiries and agency public statements.</p></div>
          <div className="text-center md:text-left"><span className="material-symbols-outlined text-primary text-4xl mb-2 block">history_edu</span><h5 className="font-bold text-on-surface">Post-Action Repo</h5><p className="text-body-sm text-on-surface-variant">Historical incident reports and audit documentation.</p></div>
        </section>
      </main>
    </div>
  );
}
