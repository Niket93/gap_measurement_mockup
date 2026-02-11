"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { OverlayPreview } from "@/components/image/OverlayPreview";
import { ZoomPanCanvas } from "@/components/image/ZoomPanCanvas";
import type { Point } from "@/lib/api/types";

export function PointPicker({
    image,
    mode,
    setMode,
    points,
    setPoints,
    onBack,
    onSubmit
}: {
    image: string;
    mode: "2" | "4";
    setMode: (m: "2" | "4") => void;
    points: Point[];
    setPoints: (p: Point[]) => void;
    onBack: () => void;
    onSubmit: () => Promise<void>;
}) {
    const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
    const needed = mode === "2" ? 2 : 4;

    useEffect(() => {
        const img = new Image();
        img.onload = () => setImgEl(img);
        img.src = image;
    }, [image]);

    const canSubmit = useMemo(() => points.length === needed, [points.length, needed]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
                <OverlayPreview points={points} mode={mode} />
                <div className="flex gap-2">
                    <Toggle
                        pressed={mode === "2"}
                        onPressedChange={(v) => {
                            if (v) {
                                setMode("2");
                                setPoints([]);
                            }
                        }}
                        label="2-point"
                    />
                    <Toggle
                        pressed={mode === "4"}
                        onPressedChange={(v) => {
                            if (v) {
                                setMode("4");
                                setPoints([]);
                            }
                        }}
                        label="4-point"
                    />
                </div>
            </div>

            {imgEl ? (
                <ZoomPanCanvas
                    image={imgEl}
                    points={points}
                    mode={mode}
                    onAddPoint={(p) => setPoints([...points, p])}
                    onUndo={() => setPoints(points.slice(0, -1))}
                    onReset={() => setPoints([])}
                />
            ) : (
                <div className="text-sm text-zinc-500">Loading image…</div>
            )}

            <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={onSubmit} disabled={!canSubmit}>
                    Measure
                </Button>
            </div>
        </div>
    );
}
