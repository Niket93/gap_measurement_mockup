export type Point = { x: number; y: number };

export type PointMode = "2" | "4";

export type MeasureResponse = {
    measurement_mm: number;
    confidence: "HIGH" | "MEDIUM" | "LOW";
    qa_notes: string[];
    annotated_image_base64_png: string;
};
