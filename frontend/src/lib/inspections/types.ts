export type FlightPhase = "Pre-Flight" | "In-Flight" | "Post-Flight";
export type MajorCategory = "Interior Inspection" | "External Inspection";

export type AircraftType =
  | "Challenger 3500"
  | "Challenger 650"
  | "Global 5500"
  | "Global 6000"
  | "Global 7500"
  | "Global 8000";

export type TaskKey = "steps_gaps" | "colour_mismatch" | "wood" | "seats";

export type DefectRecord = {
  id: string;
  createdAt: string;
  measurement_mm: number;
  note: string;
};

export type Inspection = {
  id: string;
  createdAt: string;
  aircraftNo: string;
  aircraftType: AircraftType;
  phase: FlightPhase;
  majorCategory: MajorCategory;
  createdByEmail: string;
  defects: DefectRecord[];
};
