"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sosService } from "@/services";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

const HOLD_DURATION = 3000; // ms

export default function SOSPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef<number>(0);

  // Get GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => toast.error("Could not get GPS location. Using default.")
      );
    }
  }, []);

  const stopHold = useCallback(() => {
    setIsHolding(false);
    setProgress(0);
    if (holdTimer.current) clearInterval(holdTimer.current);
  }, []);

  const startHold = useCallback(() => {
    if (submitted || isSubmitting) return;
    setIsHolding(true);
    startTime.current = Date.now();

    holdTimer.current = setInterval(async () => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(holdTimer.current!);
        setIsHolding(false);
        setIsSubmitting(true);

        if (!user) {
          toast.error("You must be logged in to send an SOS.");
          setIsSubmitting(false);
          return;
        }

        try {
          await sosService.create({
            type: "OTHER",
            description: "Emergency SOS sent from dashboard.",
            latitude: coords?.lat ?? 0,
            longitude: coords?.lng ?? 0,
            severity: "HIGH",
          });
          setSubmitted(true);
          toast.success("🆘 SOS sent! Help is on the way.");
        } catch {
          toast.error("Failed to send SOS. Please call emergency services directly.");
          setIsSubmitting(false);
          setProgress(0);
        }
      }
    }, 50);
  }, [submitted, isSubmitting, user, coords]);

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main SOS Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border-l-4 border-error pl-4 py-1">
            <h1 className="text-display-lg text-error">Emergency SOS Beacon</h1>
            <p className="text-body-base text-on-surface-variant">
              Activating this will broadcast your exact GPS coordinates and emergency profile to all
              nearby rescue teams and your registered contacts.
            </p>
          </div>

          {/* SOS Button Area */}
          <div className="bg-surface-container-lowest border-2 border-error rounded-xl p-12 flex flex-col items-center justify-center text-center">
            {submitted ? (
              <div className="flex flex-col items-center gap-4">
                <span
                  className="material-symbols-outlined text-[72px]"
                  style={{ color: "#2E7D32", fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <p className="text-title-sm text-on-surface">SOS Sent Successfully!</p>
                <p className="text-body-sm text-on-surface-variant max-w-sm">
                  Your location has been broadcast to nearby responders. Stay calm and wait for
                  assistance.
                </p>
                <Link
                  href="/dashboard/requests"
                  className="mt-2 px-6 py-3 bg-primary text-on-primary rounded-lg text-label-caps hover:opacity-90 transition-opacity"
                >
                  Track My Request
                </Link>
              </div>
            ) : (
              <>
                {/* Circular progress ring */}
                <div className="relative mb-6">
                  <svg width="200" height="200" viewBox="0 0 200 200" className="absolute inset-0">
                    <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(229,57,53,0.15)" strokeWidth="8" />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#E53935"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                      transform="rotate(-90 100 100)"
                      style={{ transition: "stroke-dashoffset 0.05s linear" }}
                    />
                  </svg>
                  <button
                    id="sos-hold-btn"
                    onMouseDown={startHold}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={startHold}
                    onTouchEnd={stopHold}
                    disabled={isSubmitting}
                    className={`w-48 h-48 rounded-full bg-error text-on-error shadow-2xl flex flex-col items-center justify-center gap-2 transition-all select-none ${
                      isHolding ? "scale-95 ring-8 ring-error/30" : "hover:scale-105"
                    } ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                    aria-label="Hold for 3 seconds to send SOS"
                  >
                    <span
                      className="material-symbols-outlined text-[64px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {isSubmitting ? "hourglass_top" : "emergency"}
                    </span>
                    <span className="text-label-caps">
                      {isSubmitting ? "SENDING…" : isHolding ? `${Math.round(progress)}%` : "HOLD 3 SEC"}
                    </span>
                  </button>
                </div>

                <p className="text-body-sm text-on-surface-variant max-w-sm">
                  Press and hold the SOS button for 3 seconds to activate the emergency broadcast.
                  This action cannot be undone for 60 seconds.
                </p>
              </>
            )}
          </div>

          {/* Location Confirmation */}
          <div className="bg-surface border border-outline-variant p-6 rounded-xl">
            <h3 className="text-title-sm text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">my_location</span>
              Your Current Location
            </h3>
            <div className="bg-surface-dim h-48 rounded-lg overflow-hidden relative border border-outline-variant">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "radial-gradient(#6750a4 0.5px, transparent 0.5px)",
                  backgroundSize: "24px 24px",
                  opacity: 0.1,
                }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 bg-error rounded-full animate-ping opacity-50" />
                <div className="w-4 h-4 bg-error rounded-full absolute top-1 left-1" />
              </div>
              <div className="absolute bottom-2 left-2 bg-surface/90 backdrop-blur px-3 py-1 rounded border border-outline-variant">
                <span className="text-mono-data text-body-sm">
                  {coords
                    ? `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E`
                    : "Acquiring GPS…"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-error-container border border-error p-6 rounded-xl">
            <span className="material-symbols-outlined text-error text-4xl mb-4 block">warning</span>
            <h3 className="text-title-sm text-on-error-container mb-2">Before You Activate</h3>
            <ul className="space-y-2 text-body-sm text-on-error-container">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>
                Ensure you are in a safe location
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>
                Your phone has sufficient battery
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>
                GPS location services are enabled
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm mt-0.5">check_circle</span>
                Emergency contacts are up to date
              </li>
            </ul>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl">
            <h3 className="text-title-sm text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">contacts</span>
              Emergency Contacts
            </h3>
            <div className="space-y-3 divide-y divide-outline-variant">
              <a href="tel:112" className="flex items-center justify-between py-2">
                <div>
                  <p className="font-bold">National Emergency</p>
                  <p className="text-mono-data text-error">112</p>
                </div>
                <span className="material-symbols-outlined text-error">call</span>
              </a>
              <a href="tel:108" className="flex items-center justify-between py-2">
                <div>
                  <p className="font-bold">Ambulance</p>
                  <p className="text-mono-data text-secondary">108</p>
                </div>
                <span className="material-symbols-outlined text-secondary">call</span>
              </a>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full py-4 border border-outline text-on-surface rounded-lg text-label-caps hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
