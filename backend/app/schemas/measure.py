from __future__ import annotations

from pydantic import BaseModel, Field
from typing import List, Literal

class Point(BaseModel):
    x: float
    y: float

class GapMeasurement(BaseModel):
    gap_mm: float
    points_px: List[Point]
    widths_mm: List[float] = Field(default_factory=list)

class MeasureResponse(BaseModel):
    measurement_mm: float
    confidence: Literal["HIGH", "MEDIUM", "LOW"]
    qa_notes: List[str] = Field(default_factory=list)
    annotated_image_base64_png: str
    measurements: List[GapMeasurement] = Field(default_factory=list)
