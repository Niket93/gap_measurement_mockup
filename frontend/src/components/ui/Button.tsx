"use client";

import { cn } from "@/lib/utils/cn";
import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ variant = "primary", className, ...props }: Props) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-700 " +
        "disabled:opacity-50 disabled:pointer-events-none";

    const styles: Record<string, string> = {
        primary:
            "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
        secondary:
            "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800",
        ghost:
            "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900",
        danger:
            "bg-red-600 text-white hover:bg-red-700"
    };

    return (
        <button className={cn(base, styles[variant], className)} {...props} />
    );
}
