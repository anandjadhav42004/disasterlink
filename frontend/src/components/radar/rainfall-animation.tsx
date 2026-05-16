"use client";

export function RainfallAnimation({ active = true }: { active?: boolean }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 mix-blend-screen">
      <div className="absolute inset-0 animate-[radar-rain_1.2s_linear_infinite]" style={{ backgroundImage: "repeating-linear-gradient(105deg, transparent 0 16px, rgba(125, 211, 252, 0.22) 17px 19px, transparent 20px 38px)" }} />
      <style jsx>{`
        @keyframes radar-rain {
          from {
            transform: translate3d(0, -28px, 0);
          }
          to {
            transform: translate3d(-26px, 28px, 0);
          }
        }
      `}</style>
    </div>
  );
}
