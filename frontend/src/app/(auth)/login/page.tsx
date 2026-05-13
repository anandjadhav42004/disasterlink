"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    identity: "",
    password: "",
    mfa: "",
    remember: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setMounted(true);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.identity) newErrors.identity = "Agency email or ID is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.identity) && formData.identity.length < 4)
      newErrors.identity = "Enter a valid email or agency ID.";
    if (!formData.password) newErrors.password = "Access token is required.";
    else if (formData.password.length < 6) newErrors.password = "Must be at least 6 characters.";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    // Authenticate and redirect
    await login(formData.identity, formData.password);
    setIsLoading(false);
    setSubmitStatus("success");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const stats = [
    { value: "24/7", label: "Surveillance" },
    { value: "1.2M", label: "Resources Linked" },
    { value: "340+", label: "Active Responders" },
  ];

  const alerts = [
    { level: "critical", text: "Cyclone Warning — Gujarat Coast", time: "2m ago" },
    { level: "warning", text: "Flood Advisory — Surat South", time: "14m ago" },
    { level: "safe", text: "Shelter Opened — Vadodara #4", time: "28m ago" },
  ];

  return (
    <main
      id="main-content"
      className="min-h-screen flex flex-col md:flex-row overflow-hidden"
      style={{ fontFamily: "var(--font-sans, 'IBM Plex Sans', sans-serif)" }}
    >
      {/* ── Top security stripe ── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center gap-2 px-4"
        style={{
          height: "28px",
          background: "linear-gradient(90deg, #0B1F33 0%, #1A3A52 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "13px", color: "#4CAF50" }}
          aria-hidden="true"
        >
          verified_user
        </span>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>
          SECURE CONNECTION · TLS 1.3 · FIPS 140-2 COMPLIANT · AUTHORISED ACCESS ONLY
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#4CAF50",
              animation: mounted ? "pulse-dot 2s infinite" : "none",
            }}
          />
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Network Operational</span>
        </div>
      </div>

      {/* ── LEFT PANEL ── */}
      <section
        className="relative w-full md:w-1/2 lg:w-3/5 flex items-end overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0B1F33 0%, #102847 50%, #0d2240 100%)",
          minHeight: "320px",
          paddingTop: "28px",
        }}
      >
        {/* Grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "30%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(21,101,192,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 w-full p-8 md:p-12" style={{ paddingBottom: "48px" }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <Image src="/logo.png" alt="DisasterLink Logo" width={48} height={48} className="shrink-0 object-contain" />
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.02em" }}>
                DisasterLink
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", letterSpacing: "0.1em" }}>
                NATIONAL COMMAND PLATFORM
              </div>
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(251,140,0,0.15)",
              border: "1px solid rgba(251,140,0,0.3)",
              borderRadius: "100px",
              padding: "4px 12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FB8C00" }}
            />
            <span style={{ fontSize: "11px", color: "#FB8C00", fontWeight: 600, letterSpacing: "0.08em" }}>
              OPERATIONAL READINESS ACTIVE
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 3.5vw, 44px)",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "16px",
              maxWidth: "520px",
            }}
          >
            National Emergency
            <br />
            <span style={{ color: "rgba(255,255,255,0.55)" }}>Management Command</span>
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "16px",
              lineHeight: 1.75,
              maxWidth: "480px",
              marginBottom: "40px",
            }}
          >
            Unified coordination for incident command, resource deployment, and survivor response.
            Built for agencies that cannot afford to fail.
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "32px",
              paddingTop: "28px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              marginBottom: "40px",
            }}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <div style={{ color: "white", fontSize: "22px", fontWeight: 700 }}>{s.value}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", letterSpacing: "0.08em", marginTop: "2px" }}>
                  {s.label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* Live alerts feed */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "16px 20px",
              maxWidth: "480px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#E53935",
                  animation: mounted ? "pulse-dot 1.5s infinite" : "none",
                }}
              />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.08em" }}>
                LIVE INCIDENT FEED
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {alerts.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background:
                        a.level === "critical" ? "#E53935" : a.level === "warning" ? "#FB8C00" : "#2E7D32",
                    }}
                  />
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", flex: 1 }}>{a.text}</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RIGHT PANEL — Auth Form ── */}
      <section
        className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center"
        style={{
          background: "#F7F9FC",
          padding: "clamp(24px, 5vw, 64px) clamp(24px, 4vw, 48px)",
          paddingTop: "calc(28px + clamp(24px, 5vw, 64px))",
          minHeight: "100vh",
        }}
      >
        <div style={{ width: "100%", maxWidth: "380px" }}>

          {/* Header */}
          <header style={{ marginBottom: "36px" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#0B1F33",
                letterSpacing: "-0.02em",
                marginBottom: "6px",
              }}
            >
              Secure Sign-In
            </h2>
            <p style={{ fontSize: "14px", color: "#5A6B7A", lineHeight: 1.6 }}>
              Authorized personnel only. Federal access protocols active.
            </p>
          </header>

          {/* Success state */}
          {submitStatus === "success" && (
            <div
              style={{
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#2E7D32", fontSize: "22px" }}
                aria-hidden="true"
              >
                check_circle
              </span>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#166534" }}>Authentication Successful</div>
                <div style={{ fontSize: "12px", color: "#15803d" }}>Redirecting to command dashboard…</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Identity field */}
            <div>
              <label
                htmlFor="identity"
                style={{ fontSize: "11px", fontWeight: 600, color: "#5A6B7A", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}
              >
                AGENCY EMAIL OR ID
              </label>
              <div style={{ position: "relative" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "18px",
                    color: focusedField === "identity" ? "#0B1F33" : "#9CA8B3",
                    transition: "color 0.15s",
                    pointerEvents: "none",
                  }}
                  aria-hidden="true"
                >
                  account_circle
                </span>
                <input
                  id="identity"
                  type="text"
                  placeholder="name@agency.gov"
                  required
                  suppressHydrationWarning
                  value={formData.identity}
                  onChange={(e) => handleChange("identity", e.target.value)}
                  onFocus={() => setFocusedField("identity")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: "100%",
                    paddingLeft: "44px",
                    paddingRight: "16px",
                    paddingTop: "14px",
                    paddingBottom: "14px",
                    background: "white",
                    border: `1.5px solid ${errors.identity ? "#E53935" : focusedField === "identity" ? "#0B1F33" : "#E2E8F0"}`,
                    borderRadius: "10px",
                    fontSize: "15px",
                    color: "#0B1F33",
                    outline: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxShadow: focusedField === "identity" ? "0 0 0 3px rgba(11,31,51,0.08)" : "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {errors.identity && (
                <p style={{ fontSize: "12px", color: "#E53935", marginTop: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "13px" }} aria-hidden="true">error</span>
                  {errors.identity}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: "11px", fontWeight: 600, color: "#5A6B7A", letterSpacing: "0.08em" }}
                >
                  ACCESS TOKEN / PASSWORD
                </label>
                <a
                  href="#"
                  style={{ fontSize: "12px", color: "#0B1F33", fontWeight: 500, textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  Forgot access?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "18px",
                    color: focusedField === "password" ? "#0B1F33" : "#9CA8B3",
                    transition: "color 0.15s",
                    pointerEvents: "none",
                  }}
                  aria-hidden="true"
                >
                  key
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                  suppressHydrationWarning
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: "100%",
                    paddingLeft: "44px",
                    paddingRight: "48px",
                    paddingTop: "14px",
                    paddingBottom: "14px",
                    background: "white",
                    border: `1.5px solid ${errors.password ? "#E53935" : focusedField === "password" ? "#0B1F33" : "#E2E8F0"}`,
                    borderRadius: "10px",
                    fontSize: "15px",
                    color: "#0B1F33",
                    outline: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxShadow: focusedField === "password" ? "0 0 0 3px rgba(11,31,51,0.08)" : "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9CA8B3",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }} aria-hidden="true">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: "12px", color: "#E53935", marginTop: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "13px" }} aria-hidden="true">error</span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* MFA field */}
            <div>
              <label
                htmlFor="mfa"
                style={{ fontSize: "11px", fontWeight: 600, color: "#5A6B7A", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}
              >
                MFA — REGISTERED DEVICE <span style={{ color: "#9CA8B3", fontWeight: 400 }}>(OPTIONAL)</span>
              </label>
              <div style={{ position: "relative" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "18px",
                    color: focusedField === "mfa" ? "#0B1F33" : "#9CA8B3",
                    transition: "color 0.15s",
                    pointerEvents: "none",
                  }}
                  aria-hidden="true"
                >
                  smartphone
                </span>
                <input
                  id="mfa"
                  type="tel"
                  placeholder="+91 98765 43210"
                  suppressHydrationWarning
                  value={formData.mfa}
                  onChange={(e) => handleChange("mfa", e.target.value)}
                  onFocus={() => setFocusedField("mfa")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: "100%",
                    paddingLeft: "44px",
                    paddingRight: "16px",
                    paddingTop: "14px",
                    paddingBottom: "14px",
                    background: "white",
                    border: `1.5px solid ${focusedField === "mfa" ? "#0B1F33" : "#E2E8F0"}`,
                    borderRadius: "10px",
                    fontSize: "15px",
                    color: "#0B1F33",
                    outline: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    boxShadow: focusedField === "mfa" ? "0 0 0 3px rgba(11,31,51,0.08)" : "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <p style={{ fontSize: "11px", color: "#9CA8B3", marginTop: "5px" }}>
                A one-time code will be sent to your registered device.
              </p>
            </div>

            {/* Remember checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                id="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={(e) => handleChange("remember", e.target.checked)}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "4px",
                  accentColor: "#0B1F33",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <label
                htmlFor="remember"
                style={{ fontSize: "13px", color: "#5A6B7A", cursor: "pointer", lineHeight: 1.4 }}
              >
                Remember this secure workstation for 30 days
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || submitStatus === "success"}
              suppressHydrationWarning
              style={{
                width: "100%",
                padding: "16px",
                background: isLoading || submitStatus === "success" ? "#5A6B7A" : "#0B1F33",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: isLoading || submitStatus === "success" ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "background 0.2s, transform 0.1s",
                letterSpacing: "0.01em",
                marginTop: "4px",
              }}
              onMouseEnter={(e) => {
                if (!isLoading && submitStatus !== "success") {
                  e.currentTarget.style.background = "#1A3A52";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && submitStatus !== "success") {
                  e.currentTarget.style.background = "#0B1F33";
                }
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {isLoading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Authenticating…
                </>
              ) : submitStatus === "success" ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }} aria-hidden="true">check_circle</span>
                  Access Granted
                </>
              ) : (
                <>
                  Establish Secure Connection
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }} aria-hidden="true">login</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
            <span style={{ fontSize: "11px", color: "#9CA8B3", whiteSpace: "nowrap" }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: "1px", background: "#E2E8F0" }} />
          </div>

          {/* SSO button */}
          <button
            type="button"
            suppressHydrationWarning
            style={{
              width: "100%",
              padding: "13px 16px",
              background: "white",
              border: "1.5px solid #E2E8F0",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#0B1F33",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0B1F33";
              e.currentTarget.style.background = "#F7F9FC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.background = "white";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#5A6B7A" }} aria-hidden="true">
              corporate_fare
            </span>
            Sign in with Agency SSO
          </button>

          {/* Footer */}
          <footer style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #E2E8F0" }}>
            {/* Security badges */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "16px" }}>
              {[
                { icon: "verified_user", label: "FIPS 140-2" },
                { icon: "vpn_lock", label: "GovCloud" },
                { icon: "shield", label: "AES-256" },
              ].map((badge) => (
                <div key={badge.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px", color: "#9CA8B3" }}
                    aria-hidden="true"
                  >
                    {badge.icon}
                  </span>
                  <span style={{ fontSize: "11px", color: "#9CA8B3", fontWeight: 600, letterSpacing: "0.06em" }}>
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Links */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "4px 16px",
                marginBottom: "12px",
              }}
            >
              {[
                { label: "Privacy Policy", href: "/about" },
                { label: "Accessibility", href: "/about" },
                { label: "Agency Directory", href: "/contact" },
                { label: "Help", href: "/help" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontSize: "12px",
                    color: "#9CA8B3",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#0B1F33")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA8B3")}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <p style={{ fontSize: "11px", color: "#C4CDD6", textAlign: "center", lineHeight: 1.6 }}>
              © 2025 DisasterLink — National Emergency Management Agency
              <br />
              Restricted access. Unauthorised use is strictly prohibited.
            </p>
          </footer>
        </div>
      </section>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #B0BAC4; }
        * { box-sizing: border-box; }
      `}</style>
    </main>
  );
}
