"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/login");
    }, 2_200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <AppShell>
      <div className="min-h-dvh grid place-items-center px-8">
        <div className="w-full max-w-lg text-center">
          <img
            src="/assets/bombardier-logo.svg"
            alt="Bombardier"
            className="h-20 md:h-24 w-auto mx-auto opacity-95"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />

          <div className="mt-6 text-2xl md:text-3xl font-semibold tracking-tight">
            Interior <span className="text-amber-300">X</span> Exterior Inspection App
          </div>

          <div className="mt-8 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-full animate-[progress_2s_linear_1] bg-white/40" />
          </div>
          <style jsx>{`
            @keyframes progress {
              from { transform: translateX(-100%); }
              to { transform: translateX(0%); }
            }
          `}</style>

          <div className="mt-3 text-xs text-white/55">Loading…</div>
        </div>
      </div>
    </AppShell>
  );
}
