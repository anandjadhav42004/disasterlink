"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authService } from "@/services";

const CODE_LENGTH = 6;

function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const code = digits.join("");

  const setDigit = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = nextValue;
    setDigits(next);
    setError(null);
    if (nextValue && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    setDigits([...pasted.padEnd(CODE_LENGTH, " ")].map((char) => (/\d/.test(char) ? char : "")));
    inputs.current[Math.min(pasted.length, CODE_LENGTH) - 1]?.focus();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== CODE_LENGTH) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.verifyOtp({ email, code });
      toast.success("Identity verified");
      router.push("/login");
    } catch {
      setError("Invalid or expired verification code.");
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const resend = async () => {
    setIsLoading(true);
    try {
      const response = await authService.resendOtp({ email });
      setSeconds(60);
      toast.success("Code resent", { description: response.data.data?.devCode ? `Development code: ${response.data.data.devCode}` : undefined });
    } catch {
      toast.error("Could not resend code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6 relative">
      <div className="max-w-[480px] w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-container text-on-primary-container rounded-full mb-4">
            <span className="material-symbols-outlined text-[32px]">shield_person</span>
          </div>
          <h1 className="text-display-lg text-on-surface">Identity Verification</h1>
          <p className="text-body-base text-on-surface-variant max-w-sm mx-auto">
            A unique 6-digit code has been sent to <span className="font-mono text-primary">{email || "your registered agency email"}</span>.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl shadow-sm">
          <form onSubmit={submit} className="space-y-8">
            <div className="flex justify-between gap-1 sm:gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => { inputs.current[index] = node; }}
                  aria-label={`Digit ${index + 1}`}
                  value={digit}
                  onChange={(event) => setDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  className="w-12 h-16 text-center text-headline-md font-mono border border-outline bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none transition-all"
                  maxLength={1}
                  inputMode="numeric"
                  placeholder="."
                />
              ))}
            </div>
            {error && <p className="text-body-sm text-error">{error}</p>}
            <div className="flex flex-col gap-4">
              <button disabled={isLoading} className="w-full bg-primary text-on-primary py-4 px-6 rounded-lg font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2" type="submit">
                <span className="material-symbols-outlined">verified_user</span>{isLoading ? "Verifying..." : "Verify Code"}
              </button>
              <div className="flex justify-between items-center text-body-sm px-1">
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">timer</span>
                  <span>Resend in: <span className="font-mono text-primary">{String(seconds).padStart(2, "0")}s</span></span>
                </div>
                <button onClick={resend} className="text-primary font-bold hover:underline disabled:text-outline-variant disabled:no-underline" disabled={seconds > 0 || isLoading || !email} type="button">Resend Code</button>
              </div>
            </div>
          </form>
        </div>

        <div className="text-center">
          <Link href="/login" className="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 text-body-sm">
            <span className="material-symbols-outlined text-sm">arrow_back</span>Return to Mission Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background grid place-items-center text-on-surface-variant">Loading verification...</main>}>
      <VerifyContent />
    </Suspense>
  );
}
