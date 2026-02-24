"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { OverlayPreview } from "@/components/image/OverlayPreview";
import { ZoomPanCanvas } from "@/components/image/ZoomPanCanvas";
import type { Point } from "@/lib/api/types";

export function PointPicker({
    image,
    selectionMode,
    setSelectionMode,
    mode,
    setMode,
    points,
    setPoints,
    onBack,
    onSubmit
}: {
    image: string;
    selectionMode: "manual" | "auto";
    setSelectionMode: (m: "manual" | "auto") => void;
    mode: "2" | "4";
    setMode: (m: "2" | "4") => void;
    points: Point[];
    setPoints: (p: Point[]) => void;
    onBack: () => void;
    onSubmit: () => Promise<void>;
}) {
    const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
    const [autoRequested, setAutoRequested] = useState(false);
    const needed = mode === "2" ? 2 : 4;

    useEffect(() => {
        const img = new Image();
        img.onload = () => setImgEl(img);
        img.src = image;
    }, [image]);

    useEffect(() => {
        if (selectionMode === "auto" && !autoRequested) {
            setAutoRequested(true);
            onSubmit();
        }
    }, [selectionMode, autoRequested, onSubmit]);

    const canSubmit = useMemo(() => points.length === needed, [points.length, needed]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
                <OverlayPreview points={points} mode={mode} selectionMode={selectionMode} />
                <div className="flex gap-2">
                    <Toggle
                        pressed={selectionMode === "auto"}
                        onPressedChange={(v) => {
                            if (v) {
                                setSelectionMode("auto");
                                setPoints([]);
                            } else {
                                setSelectionMode("manual");
                                setPoints([]);
                            }
                            setAutoRequested(false);
                        }}
                        label="Auto"
                    />
                    <Toggle
                        pressed={selectionMode === "manual"}
                        onPressedChange={(v) => {
                            if (v) {
                                setSelectionMode("manual");
                                setPoints([]);
                            }
                            setAutoRequested(false);
                        }}
                        label="Manual"
                    />
                </div>
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
                        disabled={selectionMode === "auto"}
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
                        disabled={selectionMode === "auto"}
                    />
                </div>
            </div>

            {selectionMode === "auto" ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                    <div className="font-medium text-white">Detecting gaps automatically…</div>
                    <div className="mt-1 text-xs text-white/60">
                        Auto-detect runs immediately. You can switch to manual mode if needed.
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Button variant="secondary" onClick={onBack}>
                            Back
                        </Button>
                        <Button
                            onClick={() => {
                                setAutoRequested(false);
                                onSubmit();
                            }}
                        >
                            Retry auto-detect
                        </Button>
                    </div>
                </div>
            ) : imgEl ? (
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

            {selectionMode === "manual" ? (
                <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={onBack}>
                        Back
                    </Button>
                    <Button onClick={onSubmit} disabled={!canSubmit}>
                        Measure
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
