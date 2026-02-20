"use client";

import { cn } from "@/lib/utils/cn";
import * as React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-white " +
          "placeholder:text-white/40 outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10",
        props.className
      )}
    />
  );
}
