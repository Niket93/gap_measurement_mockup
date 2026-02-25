export type Point = { x: number; y: number };

export type PointMode = "2" | "4";

export type SelectionMode = "manual" | "auto";

export type GapMeasurement = {
    gap_mm: number;
    points_px: Point[];
    widths_mm?: number[];
};

export type MeasureResponse = {
    measurement_mm: number;
    confidence: "HIGH" | "MEDIUM" | "LOW";
    qa_notes: string[];
    annotated_image_base64_png: string;
    measurements: GapMeasurement[];
};
