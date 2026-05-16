"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { alertService, shelterService } from "@/services";
import { OperationalWeatherBar } from "@/components/weather/operational-weather-bar";
import { RainfallChart } from "@/components/weather/rainfall-chart";
import { WeatherAlert } from "@/components/weather/weather-alert";
import { WeatherCard } from "@/components/weather/weather-card";
import { WeatherWidget } from "@/components/weather/weather-widget";
import { useRotatingWeather } from "@/hooks/useRotatingWeather";
import { useWeatherStore } from "@/store/weather-store";

interface BackendAlert {
  id: string;
  title: string;
  message: string;
  severity: string;
  createdAt: string;
}

interface BackendShelter {
  id: string;
  name: string;
  address?: string;
  capacity: number;
  occupied: number;
  contact?: string;
  latitude: number;
  longitude: number;
}

export default function CitizenDashboard() {
  const [alerts, setAlerts] = useState<BackendAlert[]>([]);
  const [shelters, setShelters] = useState<BackendShelter[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingShelters, setLoadingShelters] = useState(true);
  const {
    currentWeather,
    districtWeather,
    forecast,
    alerts: weatherAlerts,
    fetchWeatherWatchlist,
    fetchForecast,
    fetchAlerts
  } = useWeatherStore();
  const rotatingWeather = useRotatingWeather(districtWeather, currentWeather);

  useEffect(() => {
    alertService
      .getAll()
      .then((res) => setAlerts(res.data?.data?.slice(0, 3) ?? []))
      .catch(() => setAlerts([]))
      .finally(() => setLoadingAlerts(false));

    shelterService
      .nearby()
      .then((res) => setShelters(res.data?.data?.slice(0, 4) ?? []))
      .catch(() => setShelters([]))
      .finally(() => setLoadingShelters(false));

    void fetchWeatherWatchlist();
    void fetchForecast("Mumbai");
    void fetchAlerts("Mumbai");
  }, [fetchAlerts, fetchForecast, fetchWeatherWatchlist]);

  const severityColor: Record<string, string> = {
    CRITICAL: "#E53935",
    HIGH: "#FB8C00",
    MEDIUM: "#F9A825",
    LOW: "#2E7D32",
  };

  return (
    <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6">
      <OperationalWeatherBar weather={rotatingWeather} alerts={weatherAlerts} />

      {/* Emergency SOS Section */}
      <section className="mb-8">
        <div className="bg-error-container p-6 rounded-xl border-2 border-error flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-display-lg text-on-error-container mb-1">Emergency Assistance</h1>
            <p className="text-body-base text-on-error-container opacity-90">
              Press and hold for 3 seconds to broadcast your GPS location to rescuers.
            </p>
          </div>
          <Link
            href="/dashboard/sos"
            className="w-full md:w-auto px-8 py-4 bg-error text-on-error text-headline-md rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              emergency
            </span>
            SEND SOS NOW
          </Link>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Alerts + Shelters */}
        <div className="md:col-span-8 space-y-4">
          {/* Citizen Weather Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeatherCard weather={rotatingWeather} />
            <div className="space-y-4">
              <RainfallChart forecast={forecast} currentWeather={rotatingWeather} />
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                <p className="text-label-caps text-on-surface-variant">Air Quality</p>
                <p className="mt-2 text-title-sm">AQI feed prepared</p>
                <p className="text-body-sm text-on-surface-variant">Placeholder for future CPCB or provider air-quality integration.</p>
              </div>
            </div>
          </div>

          {weatherAlerts.length > 0 && (
            <div className="space-y-2">
              {weatherAlerts.slice(0, 2).map((alert, index) => (
                <WeatherAlert key={alert.id ?? `${alert.title}-${index}`} alert={alert} />
              ))}
            </div>
          )}

          {/* Active Alerts */}
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-title-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-error">warning</span>
                {loadingAlerts
                  ? "Loading Alerts…"
                  : `Active Alerts (${alerts.length})`}
              </h2>
              {alerts.length > 0 && (
                <span className="text-label-caps bg-error-container text-on-error-container px-2 py-1 rounded">
                  {alerts[0]?.severity ?? "INFO"}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {loadingAlerts ? (
                <div className="p-4 text-body-sm text-on-surface-variant animate-pulse">
                  Fetching latest alerts…
                </div>
              ) : alerts.length === 0 ? (
                <div className="p-4 text-body-sm text-on-surface-variant">
                  No active alerts at this time.
                </div>
              ) : (
                alerts.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 bg-surface-container-low rounded-lg"
                    style={{
                      borderLeft: `4px solid ${severityColor[a.severity] ?? "#9CA8B3"}`,
                    }}
                  >
                    <p className="text-label-caps text-on-surface-variant mb-1">
                      {new Date(a.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-title-sm text-on-surface">{a.title}</p>
                    <p className="text-body-sm text-on-surface-variant">{a.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Nearby Shelters */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-title-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-primary">home_pin</span>
                Nearby Shelters
              </h2>
              <Link href="/shelters" className="text-label-caps text-primary hover:underline">
                VIEW SHELTERS
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-outline-variant">
              {loadingShelters ? (
                <div className="bg-surface-container-lowest p-4 text-body-sm text-on-surface-variant animate-pulse col-span-2">
                  Finding shelters near you…
                </div>
              ) : shelters.length === 0 ? (
                <div className="bg-surface-container-lowest p-4 text-body-sm text-on-surface-variant col-span-2">
                  No shelters found nearby.
                </div>
              ) : (
                shelters.map((s) => {
                  const isFull = s.occupied >= s.capacity;
                  return (
                    <div
                      key={s.id}
                      className="bg-surface-container-lowest p-4 hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <p className="text-title-sm">{s.name}</p>
                      {s.address && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-body-sm">near_me</span>
                          <p className="text-body-sm text-on-surface-variant">{s.address}</p>
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: isFull ? "#E53935" : "#2E7D32" }}
                        />
                        <p className="text-label-caps text-on-surface-variant">
                          {isFull ? "Full" : `${s.capacity - s.occupied} spots available`}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Tracking + Contacts */}
        <div className="md:col-span-4 space-y-4">
          <WeatherWidget weather={rotatingWeather} />

          {/* Request Tracking */}
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
            <h2 className="text-title-sm flex items-center gap-1 mb-4">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              Current Request
            </h2>
            <div className="relative pl-4 border-l-2 border-primary-container space-y-4">
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-primary rounded-full" />
                <p className="text-label-caps text-primary">COMPLETED</p>
                <p className="text-body-sm font-bold">Request Logged</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-primary rounded-full" />
                <p className="text-label-caps text-primary">IN TRANSIT</p>
                <p className="text-body-sm font-bold">Aid Team En Route</p>
              </div>
              <div className="relative opacity-40">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-outline-variant rounded-full" />
                <p className="text-label-caps">PENDING</p>
                <p className="text-body-sm">Final Inspection</p>
              </div>
            </div>
            <Link
              href="/dashboard/sos"
              className="w-full mt-6 py-2 border border-primary text-primary rounded-lg text-label-caps hover:bg-primary-container transition-colors block text-center"
            >
              NEW SOS REQUEST
            </Link>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="p-4 bg-surface-container-low border-b border-outline-variant">
              <h2 className="text-title-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary">contacts</span>
                Key Contacts
              </h2>
            </div>
            <div className="divide-y divide-outline-variant">
              <a className="flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors" href="tel:112">
                <div>
                  <p className="text-body-base font-bold">National Emergency</p>
                  <p className="text-mono-data text-error">112</p>
                </div>
                <span className="material-symbols-outlined text-error">call</span>
              </a>
              <a className="flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors" href="tel:108">
                <div>
                  <p className="text-body-base font-bold">Ambulance</p>
                  <p className="text-mono-data text-secondary">108</p>
                </div>
                <span className="material-symbols-outlined text-secondary">call</span>
              </a>
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
          <p className="text-label-caps">LIVE DATA</p>
        </div>
      </div>
    </main>
  );
}
