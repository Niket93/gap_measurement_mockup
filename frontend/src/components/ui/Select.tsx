"use client";

import { cn } from "@/lib/utils/cn";
import * as React from "react";

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-2xl bg-white/5 border border-white/20 px-4 py-3 text-white/95 " +
          "outline-none focus:border-white/35 focus:ring-2 focus:ring-white/15",
        props.className
      )}
    />
  );
}
