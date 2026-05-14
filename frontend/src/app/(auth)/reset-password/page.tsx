"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { authService } from "@/services";

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const verify = async () => {
    setIsLoading(true);
    try {
      await authService.verifyResetCode({ email, code });
      setVerified(true);
      toast.success("Code verified");
    } catch {
      toast.error("Invalid or expired reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await authService.resetPassword({ email, code, password });
      toast.success("Password reset complete");
      router.push("/login");
    } catch {
      toast.error("Reset failed. Check the code and password strength.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-8 space-y-5">
        <div>
          <p className="text-label-caps text-primary">Secure Reset</p>
          <h1 className="text-headline-md text-on-surface">Reset Password</h1>
        </div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full p-3 rounded-lg border border-outline-variant bg-surface" placeholder="Agency email" />
        <div className="flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" required className="flex-1 p-3 rounded-lg border border-outline-variant bg-surface font-mono" placeholder="6-digit code" />
          <button type="button" onClick={verify} disabled={isLoading || code.length !== 6} className="px-4 rounded-lg border border-primary text-primary text-label-caps disabled:opacity-50">Verify</button>
        </div>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required disabled={!verified} className="w-full p-3 rounded-lg border border-outline-variant bg-surface disabled:opacity-50" placeholder="New password" />
        <button disabled={isLoading || !verified} className="w-full bg-primary text-on-primary py-3 rounded-lg text-label-caps disabled:opacity-60">
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
        <Link href="/forgot-password" className="text-body-sm text-on-surface-variant hover:text-primary">Request a new code</Link>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background grid place-items-center text-on-surface-variant">Loading reset flow...</main>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
