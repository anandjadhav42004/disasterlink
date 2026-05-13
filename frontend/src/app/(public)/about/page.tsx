"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <main className="max-w-[1440px] mx-auto">
        {/* Hero Section */}
        <section className="relative h-[500px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-surface-container to-surface-dim" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="relative z-10 px-6 md:px-8 max-w-3xl">
            <p className="text-label-caps text-primary mb-2 uppercase">Operational Authority</p>
            <h1 className="text-display-lg text-on-surface mb-4">National Resilience. Orchestrated at Scale.</h1>
            <p className="text-body-base text-on-surface-variant mb-8 leading-relaxed">
              DisasterLink is the definitive digital infrastructure for national emergency management. We bridge the gap between fragmented response teams, NGO resources, and federal command to ensure every crisis is met with a unified, data-driven defense.
            </p>
            <div className="flex gap-4">
              <Link href="/login" className="bg-primary text-on-primary px-6 py-4 text-label-caps rounded-lg hover:opacity-90 transition-opacity">Deploy Command</Link>
              <Link href="/about" className="border border-outline text-primary px-6 py-4 text-label-caps rounded-lg hover:bg-surface-container-high transition-colors">Infrastructure Whitepaper</Link>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 py-8 bg-surface-container-low border-y border-outline-variant">
          {[
            { label: "Active Incidents", value: "1,204", color: "text-primary" },
            { label: "Volunteer Network", value: "850K+", color: "text-primary" },
            { label: "Response Latency", value: "14ms", color: "text-tertiary" },
            { label: "Agencies Linked", value: "42", color: "text-primary" },
          ].map((stat) => (
            <div key={stat.label} className="p-6">
              <p className="text-label-caps text-on-surface-variant">{stat.label}</p>
              <p className={`text-display-lg font-mono ${stat.color}`}>{stat.value}</p>
              <div className={`h-1 w-12 ${stat.color === "text-tertiary" ? "bg-tertiary" : "bg-primary"} mt-2`} />
            </div>
          ))}
        </section>

        {/* Mission Sections - Bento Grid */}
        <section className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
            {/* Main Mission Card */}
            <div className="md:col-span-8 bg-surface border border-outline-variant p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-primary mb-4">
                  <span className="material-symbols-outlined">policy</span>
                  <span className="text-label-caps">Foundational Protocol</span>
                </div>
                <h2 className="text-headline-md text-on-surface mb-4">Our Mission: Resilient Sovereignty</h2>
                <p className="text-body-base text-on-surface-variant max-w-2xl">
                  We exist to secure national infrastructure against catastrophic failure. By centralizing sensor telemetry, logistics coordination, and volunteer mobilization into a single hardened node, DisasterLink ensures continuity of government and civil protection under the most extreme conditions.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-outline-variant pt-6">
                {[
                  { title: "Integrity", desc: "Zero-trust data validation for critical alerts." },
                  { title: "Velocity", desc: "Rapid resource deployment in sub-hour windows." },
                  { title: "Unity", desc: "Inter-agency interoperability via standardized API." },
                ].map((v) => (
                  <div key={v.title} className={v.title === "Unity" ? "hidden md:block" : ""}>
                    <p className="text-label-caps text-primary">{v.title}</p>
                    <p className="text-body-sm">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Surveillance */}
            <div className="md:col-span-4 bg-primary text-on-primary p-8 relative overflow-hidden">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-4xl mb-4 block">public</span>
                <h3 className="text-title-sm mb-2">Global Surveillance</h3>
                <p className="text-body-sm opacity-80">24/7 monitoring of seismic, atmospheric, and social distress signals worldwide.</p>
              </div>
              <div className="absolute bottom-0 right-0 w-48 h-48 opacity-20">
                <span className="material-symbols-outlined text-[12rem]">grid_view</span>
              </div>
            </div>

            {/* Supply Chain */}
            <div className="md:col-span-4 bg-surface-container-highest border border-outline-variant p-8">
              <span className="material-symbols-outlined text-primary mb-4 block">local_shipping</span>
              <h3 className="text-title-sm text-on-surface mb-2">Supply Chain Resilience</h3>
              <p className="text-body-sm text-on-surface-variant">End-to-end tracking of emergency rations, medical supplies, and shelter kits with blockchain verification.</p>
            </div>

            {/* NGO Partnerships */}
            <div className="md:col-span-4 bg-surface border border-outline-variant p-8 flex items-center justify-center text-center">
              <div>
                <h3 className="text-headline-md text-primary mb-2">42+</h3>
                <p className="text-label-caps text-on-surface">NGO Partnerships</p>
                <p className="text-body-sm text-on-surface-variant mt-4">Including Red Cross, WHO, and FEMA logistics nodes.</p>
              </div>
            </div>

            {/* Predictive Impact */}
            <div className="md:col-span-4 bg-tertiary-container text-on-tertiary-container p-8">
              <span className="material-symbols-outlined mb-4 block">analytics</span>
              <h3 className="text-title-sm mb-2">Predictive Impact</h3>
              <p className="text-body-sm">AI-driven models predicting humanitarian needs 72 hours before land-fall or tectonic shifts.</p>
            </div>
          </div>
        </section>

        {/* Operational Timeline */}
        <section className="px-6 py-8 bg-surface-container-low">
          <h2 className="text-headline-md text-on-surface mb-8 text-center">Infrastructure Evolution</h2>
          <div className="relative max-w-4xl mx-auto px-4">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-outline-variant" />
            {[
              { year: "2018", title: "The Genesis Node", desc: "Launch of the National Disaster Data Standard.", side: "left" },
              { year: "2020", title: "Volunteer Link Integration", desc: "Real-time mobilization of verified NGO responders.", side: "right" },
              { year: "2022", title: "Enterprise Command Alpha", desc: "Unified operational dashboard for multi-agency control.", side: "left" },
              { year: "Present", title: "Sovereign Cloud Deployment", desc: "Hardened server infrastructure across 4 redundant zones.", side: "right", accent: true },
            ].map((item, idx) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative mb-8 flex flex-col md:${item.side === "right" ? "flex-row-reverse" : "flex-row"} items-center gap-6`}
              >
                <div className={`flex-1 ${item.side === "left" ? "text-right hidden md:block" : "text-left hidden md:block"}`}>
                  {item.side === "left" ? (
                    <>
                      <p className="text-title-sm text-on-surface">{item.title}</p>
                      <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
                    </>
                  ) : null}
                </div>
                <div className={`z-10 w-4 h-4 rounded-full ${item.accent ? "bg-tertiary" : "bg-primary"} ring-4 ring-surface`} />
                <div className={`flex-1 ${item.side === "right" ? "text-right" : ""}`}>
                  <p className={`text-label-caps ${item.accent ? "text-tertiary" : "text-primary"}`}>{item.year}</p>
                  <div className="md:hidden">
                    <p className="text-title-sm text-on-surface">{item.title}</p>
                    <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
                  </div>
                  {item.side === "right" ? (
                    <div className="hidden md:block text-left">
                      <p className="text-title-sm text-on-surface">{item.title}</p>
                      <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 px-6 text-center bg-primary text-on-primary">
          <h2 className="text-headline-md mb-4">Secure Your Agency&apos;s Future</h2>
          <p className="text-body-base mb-8 opacity-90 max-w-xl mx-auto">Join the national network of resilient response teams. Contact DisasterLink Command for infrastructure onboarding.</p>
          <div className="flex justify-center gap-4">
            <Link href="/contact" className="bg-on-primary text-primary px-6 py-4 text-label-caps rounded-lg hover:opacity-90 transition-opacity">Request Briefing</Link>
            <Link href="/contact" className="border border-on-primary text-on-primary px-6 py-4 text-label-caps rounded-lg hover:bg-on-primary/10 transition-colors">Directory Access</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
