"use client";

import { cn } from "@/lib/utils/cn";

export function Toggle({
    pressed,
    onPressedChange,
    label,
    className
}: {
    pressed: boolean;
    onPressedChange: (v: boolean) => void;
    label: string;
    className?: string;
}) {
    return (
        <button
            type="button"
            aria-pressed={pressed}
            onClick={() => onPressedChange(!pressed)}
            className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm border transition",
                pressed
                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50"
                    : "bg-transparent text-zinc-900 dark:text-zinc-50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900",
                className
            )}
        >
            <span className="font-medium">{label}</span>
        </button>
    );
}