"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen text-on-surface">
      {/* Hero Section: Operational Readiness */}
      <section className="py-8 md:py-12 max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="lg:col-span-5 flex flex-col gap-4"
          >
            {/* Readiness Badge */}
            <motion.div variants={fadeIn}>
              <span className="inline-flex items-center gap-2 px-2 py-1 rounded bg-error-container text-on-error-container w-fit">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <span className="text-label-caps">LEVEL 3 READINESS ACTIVE</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeIn} className="text-display-lg text-on-surface leading-tight">
              National Emergency Infrastructure &amp; Response Synchronization
            </motion.h1>

            {/* Description */}
            <motion.p variants={fadeIn} className="text-body-base text-on-surface-variant">
              DisasterLink provides the federal command structure with real-time geospatial intelligence, multi-agency resource logistics, and unified communications for large-scale disaster management.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4 mt-4">
              <Link
                href="/login"
                className="bg-primary text-on-primary px-8 py-4 text-title-sm rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Access Command Center
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/about"
                className="border border-secondary text-secondary px-8 py-4 text-title-sm rounded-lg hover:bg-surface-container transition-colors"
              >
                Protocol Documentation
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm aspect-video relative"
          >
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary-container/30 to-surface-dim" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="bg-surface-container-lowest/90 backdrop-blur-md p-4 rounded-lg border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-error rounded-full animate-pulse" />
                  <span className="text-label-caps text-on-surface">LIVE FEED: PACIFIC SECTOR</span>
                </div>
                <p className="text-mono-data text-on-surface-variant">GEO-SYNC: 34.0522° N, 118.2437° W</p>
              </div>
              <div className="flex gap-1">
                <div className="w-24 h-12 bg-primary/20 backdrop-blur-sm rounded border border-primary/30" />
                <div className="w-24 h-12 bg-primary/20 backdrop-blur-sm rounded border border-primary/30" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Operational Statistics Ticker */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-surface-container-high border-y border-outline-variant py-4 px-6 mb-8 overflow-hidden"
      >
        <div className="flex items-center gap-8 whitespace-nowrap overflow-x-auto max-w-[1440px] mx-auto">
          {[
            { label: "Active Incidents", value: "124", color: "text-error" },
            { label: "Deployed Personnel", value: "12,842", color: "text-primary" },
            { label: "Agency Capacity", value: "94.2%", color: "text-tertiary" },
            { label: "Network Integrity", value: "Optimal", color: "text-secondary" },
            { label: "Last Sync", value: "0.04s Ago", color: "text-on-surface-variant" },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              className={`flex items-center gap-2 ${i < arr.length - 1 ? "pr-8 border-r border-outline-variant" : ""}`}
            >
              <span className="text-label-caps text-outline uppercase">{stat.label}</span>
              <span className={`text-mono-data text-title-sm ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Core Operational Sections: Bento Grid */}
      <section className="max-w-[1440px] mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Real-time Monitoring — Double Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-headline-md">Real-time Geospatial Monitoring</h3>
                  <p className="text-body-sm text-on-surface-variant">Global sensor fusion for atmospheric and seismic detection.</p>
                </div>
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
              </div>
              <div className="bg-surface-dim h-48 rounded-lg overflow-hidden relative border border-outline-variant">
                <div className="w-full h-full bg-gradient-to-br from-primary/10 via-surface-tint/5 to-surface-dim" />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <div className="bg-black/60 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded uppercase font-mono">Layer: Thermal</div>
                  <div className="bg-black/60 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded uppercase font-mono">Tracking: On</div>
                </div>
              </div>
            </div>
            <button className="mt-4 text-primary text-label-caps flex items-center gap-1 hover:underline">
              Expand Monitoring Interface <span className="material-symbols-outlined text-sm">open_in_full</span>
            </button>
          </motion.div>

          {/* Emergency Coordination */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6"
          >
            <span className="material-symbols-outlined text-error mb-4 block">emergency</span>
            <h3 className="text-title-sm mb-2">Emergency Coordination</h3>
            <p className="text-body-sm text-on-surface-variant mb-4">Streamlined activation of federal resources and logistical chains during rapid escalation events.</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-surface-container rounded">
                <span className="text-label-caps">Logistics</span>
                <span className="text-xs text-on-surface-variant font-mono">Active</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-surface-container rounded">
                <span className="text-label-caps">Supply Chain</span>
                <span className="text-xs text-on-surface-variant font-mono">Staging</span>
              </div>
            </div>
          </motion.div>

          {/* Agency Collaboration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6"
          >
            <span className="material-symbols-outlined text-tertiary mb-4 block">groups</span>
            <h3 className="text-title-sm mb-2">Agency Collaboration</h3>
            <p className="text-body-sm text-on-surface-variant mb-4">Secure bridge for state, local, and federal data exchange with encrypted protocols.</p>
            <div className="flex -space-x-2 overflow-hidden">
              {[
                { label: "FEMA", bg: "bg-secondary-container" },
                { label: "NWS", bg: "bg-primary-fixed" },
                { label: "USGS", bg: "bg-tertiary-fixed" },
                { label: "+12", bg: "bg-surface-dim" },
              ].map((a) => (
                <div key={a.label} className={`inline-flex h-8 w-8 rounded-full ring-2 ring-white ${a.bg} items-center justify-center font-bold text-[10px]`}>
                  {a.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Command Center CTA */}
      <section className="max-w-[1440px] mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary border border-outline rounded-xl p-8 text-on-primary flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex flex-col gap-2 max-w-2xl">
            <h2 className="text-headline-md">Begin Agency Onboarding</h2>
            <p className="text-body-base opacity-90">Secure authorization is required for full access to the DisasterLink National Command Center. Our systems meet FedRAMP High standards for data protection and operational continuity.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Link
              href="/register"
              className="bg-on-primary text-primary px-8 py-4 text-title-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors w-full md:w-auto text-center"
            >
              Request Credentials
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
