"use client";

import type { Point } from "@/lib/api/types";

export function OverlayPreview({
    points,
    mode,
    selectionMode
}: {
    points: Point[];
    mode: "2" | "4";
    selectionMode: "manual" | "auto";
}) {
    const needed = mode === "2" ? 2 : 4;
    return (
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
            {selectionMode === "auto"
                ? "Auto-detect enabled"
                : "Points: " + points.length + "/" + needed + " • " +
                  (mode === "2" ? "Select A → B" : "Select TL → TR → BR → BL")}
        </div>
    );
}
