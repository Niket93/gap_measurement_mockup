"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function TopAppBar({
  title,
  subtitle,
  userName,
  onBack,
  onLogout,
  rightSlot
}: {
  title: string;
  subtitle?: string;
  userName?: string | null;
  onBack?: () => void;
  onLogout?: () => void;
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
          <div className="px-5 py-4 md:px-6 md:py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Mark / logo */}
              <div className="shrink-0 flex items-center gap-3">
                <div className="size-10 rounded-2xl border border-white/10 bg-white/10 grid place-items-center">
                  <img
                    src="/assets/bombardier-logo.svg"
                    alt="Bombardier"
                    className="h-5 w-auto opacity-95"
                    onError={(e) => {
                      // fallback if logo not available yet
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>

              {/* Title block */}
              <div className="min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <h1 className="text-lg md:text-xl font-semibold tracking-tight text-white truncate">
                    {title}
                  </h1>
                  {userName ? (
                    <div className="hidden md:inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/10 px-3 py-1">
                      <div className="size-2 rounded-full bg-emerald-300/70" aria-hidden />
                      <div className="text-xs text-white/70 truncate max-w-[220px]">
                        {userName}
                      </div>
                    </div>
                  ) : null}
                </div>
                {subtitle ? (
                  <div className="mt-0.5 text-xs md:text-sm text-white/60 truncate">
                    {subtitle}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Actions */}
            <div className={cn("flex items-center gap-2 shrink-0", !onBack && !onLogout && !rightSlot ? "hidden" : "")}>
              {onBack ? (
                <Button variant="secondary" onClick={onBack}>
                  Back
                </Button>
              ) : null}

              {rightSlot ? rightSlot : null}

              {onLogout ? (
                <Button variant="ghost" onClick={onLogout}>
                  Logout
                </Button>
              ) : null}
            </div>
          </div>

          {/* Mobile user pill */}
          {userName ? (
            <div className="px-5 pb-4 md:hidden">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/10 px-3 py-1">
                <div className="size-2 rounded-full bg-emerald-300/70" aria-hidden />
                <div className="text-xs text-white/70 truncate max-w-[75vw]">
                  {userName}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
