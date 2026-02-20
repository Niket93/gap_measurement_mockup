"use client";

import { create } from "zustand";
import type { Inspection, AircraftType, FlightPhase, MajorCategory, DefectRecord } from "./types";
import { SEEDED_HISTORY } from "@/lib/demo/constants";

const KEY = "ixei_inspections";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function load(): Inspection[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Inspection[];
  } catch {
    return [];
  }
}

function save(items: Inspection[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

type State = {
  inspections: Inspection[];
  hydrate: () => void;

  createInspection: (i: {
    aircraftNo: string;
    aircraftType: AircraftType;
    phase: FlightPhase;
    majorCategory: MajorCategory;
    createdByEmail: string;
  }) => Inspection;

  getById: (id: string) => Inspection | undefined;

  addDefect: (inspectionId: string, defect: Omit<DefectRecord, "id" | "createdAt">) => void;
};

export const useInspectionStore = create<State>((set, get) => ({
  inspections: [],

  hydrate: () => {
    const items = load();
    set({ inspections: items.length ? items : SEEDED_HISTORY });
  },

  createInspection: (i) => {
    const newItem: Inspection = {
      id: uid(),
      createdAt: new Date().toISOString(),
      defects: [],
      ...i
    };
    const next = [newItem, ...get().inspections];
    set({ inspections: next });
    save(next);
    return newItem;
  },

  getById: (id) => get().inspections.find((x) => x.id === id),

  addDefect: (inspectionId, defect) => {
    const next = get().inspections.map((insp) => {
      if (insp.id !== inspectionId) return insp;
      const newDefect: DefectRecord = {
        id: uid(),
        createdAt: new Date().toISOString(),
        ...defect
      };
      return { ...insp, defects: [newDefect, ...insp.defects] };
    });

    set({ inspections: next });
    save(next);
  }
}));
