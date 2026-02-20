import type { AircraftType, FlightPhase, MajorCategory, Inspection, TaskKey } from "@/lib/inspections/types";

export const AIRCRAFT_TYPES: AircraftType[] = [
  "Challenger 3500",
  "Challenger 650",
  "Global 5500",
  "Global 6000",
  "Global 7500",
  "Global 8000"
];

export const FLIGHT_PHASES: FlightPhase[] = ["Pre-Flight", "In-Flight", "Post-Flight"];

export const MAJOR_CATEGORIES: MajorCategory[] = ["Interior Inspection", "External Inspection"];

export const INTERIOR_TASKS: Array<{
  key: TaskKey;
  title: string;
  subtitle: string;
}> = [
  { key: "steps_gaps", title: "Inspect Steps & Gaps", subtitle: "Inspects & Measure Gaps." },
  { key: "colour_mismatch", title: "Inspect Colour Mismatch", subtitle: "Detect Visual Mismatch." },
  { key: "wood", title: "Inspect Wood", subtitle: "Surface and Finish Inspection." },
  { key: "seats", title: "Inspect Seats", subtitle: "Seat Alignment and Wear Checks." }
];

export const SEEDED_HISTORY: Inspection[] = [
{
    id: "seed-001",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1d ago
    aircraftNo: "N123TG",
    aircraftType: "Global 7500",
    phase: "Pre-Flight",
    majorCategory: "Interior Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [
      {
        id: "def-211",
        createdAt: new Date(Date.now() - 86400000 * 1 + 3600 * 1000).toISOString(),
        measurement_mm: 1.2,
        note: "[seats] Wear noted on aisle seat track; minor play measured.",
      },
    ],
  },
  {
    id: "seed-002",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    aircraftNo: "C-FBQA",
    aircraftType: "Challenger 3500",
    phase: "Pre-Flight",
    majorCategory: "External Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [{
        id: "def-202",
        createdAt: new Date(Date.now() - 86400000 * 3 - 3600 * 1000).toISOString(),
        measurement_mm: 0.0,
        note: "[colour_mismatch] Slight tone variance on sidewall panel vs. spec chip.",
      },],
  },
  {
    id: "seed-003",
    createdAt: new Date(Date.now() - 86400000 * 3 - 3600 * 1000 * 2).toISOString(), // 3d 2h ago
    aircraftNo: "C-G800",
    aircraftType: "Global 8000",
    phase: "Pre-Flight",
    majorCategory: "Interior Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [
      {
        id: "def-202",
        createdAt: new Date(Date.now() - 86400000 * 3 - 3600 * 1000).toISOString(),
        measurement_mm: 0.0,
        note: "[colour_mismatch] Slight tone variance on sidewall panel vs. spec chip.",
      },
    ],
  },
  {
    id: "seed-004",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    aircraftNo: "N77GL",
    aircraftType: "Global 6000",
    phase: "Pre-Flight",
    majorCategory: "External Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [],
  },
  {
    id: "seed-005",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    aircraftNo: "C-F650X",
    aircraftType: "Challenger 650",
    phase: "In-Flight",
    majorCategory: "Interior Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [
    ],
  },
  {
    id: "seed-006",
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    aircraftNo: "N905QS",
    aircraftType: "Global 5500",
    phase: "In-Flight",
    majorCategory: "External Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [],
  },
  {
    id: "seed-007",
    createdAt: new Date(Date.now() - 86400000 * 7 - 3600 * 1000).toISOString(),
    aircraftNo: "C-FG75",
    aircraftType: "Global 7500",
    phase: "In-Flight",
    majorCategory: "Interior Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [
      {
        id: "def-214",
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        measurement_mm: 0.8,
        note: "[seats] Recline handle bezel misalignment; minor gap at trim ring.",
      },
      {
        id: "def-215",
        createdAt: new Date(Date.now() - 86400000 * 7 + 3600 * 1000).toISOString(),
        measurement_mm: 0.5,
        note: "[colour_mismatch] Slight fabric hue deviation under cabin lighting.",
      },
    ],
  },
  {
    id: "seed-008",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    aircraftNo: "C-GC35",
    aircraftType: "Challenger 3500",
    phase: "In-Flight",
    majorCategory: "External Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [],
  },
  {
    id: "seed-009",
    createdAt: new Date(Date.now() - 86400000 * 9 - 3600 * 1000 * 6).toISOString(),
    aircraftNo: "N650CJ",
    aircraftType: "Challenger 650",
    phase: "Post-Flight",
    majorCategory: "Interior Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [
    ],
  },
  {
    id: "seed-010",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    aircraftNo: "C-FG60",
    aircraftType: "Global 6000",
    phase: "Post-Flight",
    majorCategory: "External Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [],
  },
  {
    id: "seed-011",
    createdAt: new Date(Date.now() - 86400000 * 11 - 3600 * 1000 * 3).toISOString(),
    aircraftNo: "N800GX",
    aircraftType: "Global 8000",
    phase: "Post-Flight",
    majorCategory: "Interior Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [
      {
        id: "def-007",
        createdAt: new Date(Date.now() - 86400000 * 11 - 3600 * 1000 * 2).toISOString(),
        measurement_mm: 1.1,
        note: "[wood] Veneer seam step at table leaf joint.",
      },
      {
        id: "def-008",
        createdAt: new Date(Date.now() - 86400000 * 11 - 3600 * 1000).toISOString(),
        measurement_mm: 0.7,
        note: "[colour_mismatch] Armrest leather slightly warmer tone vs. seat base.",
      },
    ],
  },
  {
    id: "seed-012",
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    aircraftNo: "C-F350",
    aircraftType: "Challenger 3500",
    phase: "Post-Flight",
    majorCategory: "External Inspection",
    createdByEmail: "inspector@aero.bombardier.com",
    defects: [],
  }
];
