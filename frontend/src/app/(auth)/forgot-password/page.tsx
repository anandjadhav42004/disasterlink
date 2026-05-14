"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authService } from "@/services";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      setDevCode(response.data.data?.devCode ?? null);
      toast.success("Reset code sent", { description: "Check the registered email channel for the 6-digit code." });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("Could not start reset flow");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-8 space-y-6">
        <div>
          <p className="text-label-caps text-primary">Account Recovery</p>
          <h1 className="text-headline-md text-on-surface">Forgot Access?</h1>
          <p className="text-body-sm text-on-surface-variant mt-2">Enter your agency email. DisasterLink will issue a short-lived reset code and log the recovery event.</p>
        </div>
        <label className="block">
          <span className="text-label-caps text-on-surface-variant">Agency Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full p-3 rounded-lg border border-outline-variant bg-surface outline-none focus:border-primary" placeholder="name@agency.gov" />
        </label>
        {devCode && <p className="text-body-sm text-tertiary">Development reset code: <span className="font-mono">{devCode}</span></p>}
        <button disabled={isLoading} className="w-full bg-primary text-on-primary py-3 rounded-lg text-label-caps disabled:opacity-60">
          {isLoading ? "Issuing Code..." : "Send Reset Code"}
        </button>
        <Link href="/login" className="text-body-sm text-on-surface-variant hover:text-primary inline-flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span>Return to login
        </Link>
      </form>
    </main>
  );
}
