"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";

export function Toast({
  open,
  message,
  onClose,
  tone = "info"
}: {
  open: boolean;
  message: string;
  onClose: () => void;
  tone?: "info" | "success" | "danger";
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  const toneCls =
    tone === "success"
      ? "border-emerald-400/20 bg-emerald-500/10"
      : tone === "danger"
        ? "border-red-400/20 bg-red-500/10"
        : "border-white/12 bg-white/8";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(520px,92vw)]">
      <div className={cn("rounded-2xl border backdrop-blur px-4 py-3 text-sm text-white shadow-lg", toneCls)}>
        {message}
      </div>
    </div>
  );
}