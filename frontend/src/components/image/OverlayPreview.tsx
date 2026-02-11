"use client";

import type { Point } from "@/lib/api/types";

export function OverlayPreview({
    points,
    mode
}: {
    points: Point[];
    mode: "2" | "4";
}) {
    const needed = mode === "2" ? 2 : 4;
    return (
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
            Points: {points.length}/{needed} •{" "}
            {mode === "2" ? "Select A → B" : "Select TL → TR → BR → BL"}
        </div>
    );
}
