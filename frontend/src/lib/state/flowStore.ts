"use client";

import { create } from "zustand";
import type { MeasureResponse, Point, PointMode, SelectionMode } from "@/lib/api/types";
import { measureGap } from "@/lib/api/client";

type FlowState = {
    step: number; // 0..3
    image: string | null; // data URL
    selectionMode: SelectionMode;
    pointMode: PointMode;
    points: Point[];
    result: MeasureResponse | null;
    error: string | null;

    setStep: (s: number) => void;
    setImage: (img: string) => void;
    setSelectionMode: (m: SelectionMode) => void;
    setPointMode: (m: PointMode) => void;
    setPoints: (p: Point[]) => void;

    clearError: () => void;

    resetToCapture: () => void;
    resetAll: () => void;

    submitMeasurement: () => Promise<void>;
};

export const useFlowStore = create<FlowState>((set, get) => ({
    step: 0,
    image: null,
    selectionMode: "auto",
    pointMode: "2",
    points: [],
    result: null,
    error: null,

    setStep: (s) => set({ step: s }),
    setImage: (img) => set({ image: img }),
    setSelectionMode: (m) => set({ selectionMode: m }),
    setPointMode: (m) => set({ pointMode: m }),
    setPoints: (p) => set({ points: p }),

    clearError: () => set({ error: null }),

    resetToCapture: () =>
        set({
            step: 0,
            image: null,
            selectionMode: "auto",
            points: [],
            result: null,
            error: null
        }),

    resetAll: () =>
        set({
            step: 0,
            image: null,
            selectionMode: "auto",
            pointMode: "2",
            points: [],
            result: null,
            error: null
        }),

    submitMeasurement: async () => {
        const { image, selectionMode, pointMode, points } = get();
        if (!image) return;

        set({ error: null });

        try {
            const res = await measureGap(
                selectionMode === "auto"
                    ? { imageDataUrl: image, mode: "auto" }
                    : { imageDataUrl: image, mode: pointMode, points }
            );
            set({ result: res, step: 3 });
        } catch (e: any) {
            set({ error: String(e?.message ?? e) });
        }
    }
}));
