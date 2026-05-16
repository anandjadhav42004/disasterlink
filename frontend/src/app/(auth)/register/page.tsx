"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

type Role = "citizen" | "volunteer";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [role, setRole] = useState<Role>("citizen");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = "First name is required.";
    if (!formData.lastName.trim()) e.lastName = "Last name is required.";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      e.email = "A valid email is required.";
    if (!formData.phone.trim()) e.phone = "Phone number is required.";
    if (!formData.password || formData.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    return e;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    clearError();
    setIsLoading(true);
    try {
      const result = await register({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
      });
      if (!result.success) {
        const message = result.error ?? useAuthStore.getState().error ?? authError ?? "Registration failed. Please try again.";
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes("email")) {
          setErrors((prev) => ({ ...prev, email: message }));
        } else if (lowerMessage.includes("phone")) {
          setErrors((prev) => ({ ...prev, phone: message }));
        }
        setIsLoading(false);
        toast.error(message);
        return;
      }
      toast.success("Account created! Redirecting…");
      setTimeout(() => router.push(result.redirectTo ?? "/dashboard"), 1200);
    } catch {
      setIsLoading(false);
      toast.error(useAuthStore.getState().error ?? authError ?? "Registration failed. Please try again.");
    }
  };

  const field = (
    label: string,
    key: keyof typeof formData,
    type = "text",
    placeholder = ""
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-label-caps text-on-surface-variant">{label}</label>
      <input
        className="w-full p-4 border border-outline-variant rounded-lg focus:ring-0 focus:border-primary bg-surface-container-lowest text-body-base outline-none transition-colors"
        style={{ borderColor: errors[key] ? "#E53935" : undefined }}
        type={type}
        placeholder={placeholder}
        value={formData[key]}
        onChange={(e) => handleChange(key, e.target.value)}
      />
      {errors[key] && (
        <p className="text-body-sm" style={{ color: "#E53935" }}>
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-on-background flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-start py-8 px-4">
        <div className="w-full max-w-4xl space-y-8">
          {/* Progress Indicator */}
          <div className="w-full">
            <div className="flex justify-between items-end mb-2">
              <span className="text-label-caps text-primary">Mission Step 01 of 03</span>
              <span className="text-label-caps text-on-surface-variant uppercase">
                Create Account
              </span>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary w-1/3" />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-body-sm text-primary font-bold">Personal Data</span>
              <span className="text-body-sm text-outline">Verification</span>
              <span className="text-body-sm text-outline">Dashboard</span>
            </div>
          </div>

          {/* Bento Layout */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="border-l-4 border-primary pl-4 py-1">
                <h1 className="text-headline-md text-on-surface">Personnel Registration</h1>
                <p className="text-body-base text-on-surface-variant">
                  Complete your profile to enable rapid deployment during critical incidents.
                </p>
              </div>

              {/* Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <input
                    className="peer sr-only"
                    name="role"
                    type="radio"
                    checked={role === "volunteer"}
                    onChange={() => setRole("volunteer")}
                  />
                  <div className="p-6 border border-outline-variant bg-surface rounded-xl peer-checked:border-primary peer-checked:bg-secondary-container transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="material-symbols-outlined text-primary text-3xl">
                        volunteer_activism
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          role === "volunteer" ? "border-primary bg-primary" : "border-outline-variant"
                        }`}
                      />
                    </div>
                    <h3 className="text-title-sm text-on-surface">Active Volunteer</h3>
                    <p className="text-body-sm text-on-surface-variant">
                      Register to assist in field operations, shelter management, or logistics.
                    </p>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input
                    className="peer sr-only"
                    name="role"
                    type="radio"
                    checked={role === "citizen"}
                    onChange={() => setRole("citizen")}
                  />
                  <div className="p-6 border border-outline-variant bg-surface rounded-xl peer-checked:border-primary peer-checked:bg-secondary-container transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="material-symbols-outlined text-primary text-3xl">
                        person_pin_circle
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          role === "citizen" ? "border-primary bg-primary" : "border-outline-variant"
                        }`}
                      />
                    </div>
                    <h3 className="text-title-sm text-on-surface">Citizen / Survivor</h3>
                    <p className="text-body-sm text-on-surface-variant">
                      Receive localised alerts, emergency instructions, and SOS assistance.
                    </p>
                  </div>
                </label>
              </div>

              {/* Form Fields */}
              <div className="bg-surface border border-outline-variant p-6 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {field("Legal First Name", "firstName", "text", "John")}
                  {field("Legal Last Name", "lastName", "text", "Doe")}
                </div>
                {field("Email Address", "email", "email", "j.doe@agency.gov")}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {field("Contact Number", "phone", "tel", "+91 98765 43210")}
                  {field("Password (min 8 chars)", "password", "password", "••••••••")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-label-caps text-on-surface-variant">Date of Birth</label>
                    <input className="w-full p-4 border border-outline-variant rounded-lg focus:ring-0 focus:border-primary bg-surface-container-lowest text-body-base" type="date"/>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-error">contact_emergency</span>
                  <h2 className="text-title-sm text-on-surface">Emergency Contact Protocol</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-label-caps text-on-surface-variant">Contact Name</label>
                    <input className="w-full p-4 border border-outline-variant rounded-lg focus:ring-0 focus:border-primary bg-surface-container-lowest text-body-base" placeholder="Full Name" type="text"/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-label-caps text-on-surface-variant">Relationship</label>
                    <select className="w-full p-4 border border-outline-variant rounded-lg focus:ring-0 focus:border-primary bg-surface-container-lowest text-body-base">
                      <option>Spouse / Partner</option>
                      <option>Parent / Guardian</option>
                      <option>Sibling</option>
                      <option>Professional Peer</option>
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
                <p className="text-body-sm opacity-90">
                  All registration data is encrypted using FIPS 140-2 standards. Your information
                  is only visible to verified agency command staff during active emergencies.
                </p>
              </div>
              <div className="p-6 bg-surface-container-highest rounded-xl border border-outline-variant">
                <h4 className="text-label-caps text-on-surface-variant mb-4">Quick Navigation</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-body-sm text-primary hover:underline cursor-pointer">
                    <span className="material-symbols-outlined text-sm">help</span>Need help?
                  </li>
                  <li className="flex items-center gap-2 text-body-sm text-primary hover:underline cursor-pointer">
                    <span className="material-symbols-outlined text-sm">description</span>
                    Privacy Policy
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="lg:col-span-12 flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant gap-4">
              <Link
                href="/login"
                className="px-8 py-4 border border-outline text-on-surface hover:bg-surface-container-high transition-colors font-semibold rounded-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined">arrow_back</span>Back to Login
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-primary text-on-primary hover:opacity-90 disabled:opacity-60 transition-opacity font-semibold rounded-lg shadow-sm flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ animation: "spin 0.8s linear infinite" }}
                    >
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Creating Account…
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
