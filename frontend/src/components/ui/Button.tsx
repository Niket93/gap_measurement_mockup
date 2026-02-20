"use client";

import { cn } from "@/lib/utils/cn";
import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 " +
    "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]";

  const styles: Record<string, string> = {
    primary:
      "bg-white text-[#06152e] hover:bg-white/90 shadow-sm",
    secondary:
      "bg-white/10 text-white hover:bg-white/15 border border-white/15 backdrop-blur",
    ghost:
      "bg-transparent text-white/85 hover:bg-white/10",
    danger:
      "bg-red-600 text-white hover:bg-red-700"
  };

  return <button className={cn(base, styles[variant], className)} {...props} />;
}