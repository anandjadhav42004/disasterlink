"use client";

import Link from "next/link";

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6 relative">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: "radial-gradient(#7a7582 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[480px] w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-container text-on-primary-container rounded-full mb-4">
            <span className="material-symbols-outlined text-[32px]">shield_person</span>
          </div>
          <h1 className="text-display-lg text-on-surface">Identity Verification</h1>
          <p className="text-body-base text-on-surface-variant max-w-sm mx-auto">
            A unique 6-digit code has been sent to your registered agency device ending in <span className="font-mono text-mono-data text-primary">••4290</span>.
          </p>
        </div>

        {/* OTP Input */}
        <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl shadow-sm">
          <form className="space-y-8">
            <div className="flex justify-between gap-1 sm:gap-2">
              {[1,2,3].map((i) => (
                <input key={i} aria-label={`Digit ${i}`} className="w-12 h-16 text-center text-headline-md font-mono border border-outline bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none transition-all" maxLength={1} placeholder="•" type="text" />
              ))}
              <div className="flex items-center text-outline-variant"><span className="w-2 h-0.5 bg-outline-variant rounded-full" /></div>
              {[4,5,6].map((i) => (
                <input key={i} aria-label={`Digit ${i}`} className="w-12 h-16 text-center text-headline-md font-mono border border-outline bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none transition-all" maxLength={1} placeholder="•" type="text" />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <button className="w-full bg-primary text-on-primary py-4 px-6 rounded-lg font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2" type="submit">
                <span className="material-symbols-outlined">verified_user</span>Verify Code
              </button>
              <div className="flex justify-between items-center text-body-sm px-1">
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">timer</span>
                  <span>Expires in: <span className="font-mono text-primary">04:59</span></span>
                </div>
                <button className="text-primary font-bold hover:underline disabled:text-outline-variant disabled:no-underline" disabled type="button">Resend Code</button>
              </div>
            </div>
          </form>
        </div>

        {/* Security Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-lg flex gap-4 items-start">
            <span className="material-symbols-outlined text-primary">security</span>
            <div className="space-y-1">
              <span className="text-label-caps text-on-surface-variant">ENCRYPTION</span>
              <p className="text-body-sm text-on-surface">End-to-end mission-grade verification protocols in effect.</p>
            </div>
          </div>
          <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-lg flex gap-4 items-start">
            <span className="material-symbols-outlined text-primary">lock_reset</span>
            <div className="space-y-1">
              <span className="text-label-caps text-on-surface-variant">RESTRICTED</span>
              <p className="text-body-sm text-on-surface">This code is for your eyes only. DisasterLink agents will never ask for it.</p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/login" className="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1 text-body-sm">
            <span className="material-symbols-outlined text-sm">arrow_back</span>Return to Mission Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
