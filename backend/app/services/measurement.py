from __future__ import annotations

from dataclasses import dataclass
from typing import List, Literal
import numpy as np

from app.schemas.measure import Point

@dataclass
class MeasurementResult:
    gap_mm: float
    qa_notes: List[str]

def _apply_homography_points(H: np.ndarray, pts: np.ndarray) -> np.ndarray:
    pts = np.asarray(pts, dtype=np.float64).reshape(-1, 2)
    pts_h = np.hstack([pts, np.ones((pts.shape[0], 1), dtype=np.float64)])
    proj = (H @ pts_h.T).T
    out = proj[:, 0:2] / proj[:, 2:3]
    if not np.isfinite(out).all():
        raise ValueError("Invalid homography projection")
    return out

def _order_quad(pts: np.ndarray) -> np.ndarray:
    pts = np.asarray(pts, dtype=np.float64).reshape(4, 2)
    s = pts.sum(axis=1)
    diff = np.diff(pts, axis=1).ravel()
    tl = pts[np.argmin(s)]
    br = pts[np.argmax(s)]
    tr = pts[np.argmin(diff)]
    bl = pts[np.argmax(diff)]
    return np.stack([tl, tr, br, bl], axis=0)

def measure_gap_mm(H_pix_to_mm: np.ndarray, points: List[Point], mode: Literal["2", "4"], profile_step_mm: float) -> MeasurementResult:
    pts_px = np.array([[p.x, p.y] for p in points], dtype=np.float64)
    pts_mm = _apply_homography_points(H_pix_to_mm, pts_px)

    qa: List[str] = []

    if mode == "2":
        d = float(np.linalg.norm(pts_mm[1] - pts_mm[0]))
        if d <= 0.0:
            qa.append("Computed gap is non-positive; check point placement.")
        return MeasurementResult(gap_mm=d, qa_notes=qa)

    # mode == "4": profile across the quad; gap is mean width
    quad = _order_quad(pts_mm)
    TL, TR, BR, BL = quad

    top = TR - TL
    bottom = BR - BL
    left = BL - TL
    right = BR - TR

    len_v = float(np.linalg.norm(left))
    len_h = float(np.linalg.norm(top))

    step = float(profile_step_mm if profile_step_mm > 0 else 10.0)
    widths: List[float] = []

    if len_v >= len_h:
        long_len = len_v
        n_steps = max(1, int(np.floor(long_len / step)))
        for i in range(n_steps + 1):
            t = i / n_steps
            start = TL + t * left
            end = TR + t * right
            widths.append(float(np.linalg.norm(end - start)))
    else:
        long_len = len_h
        n_steps = max(1, int(np.floor(long_len / step)))
        for i in range(n_steps + 1):
            t = i / n_steps
            start = TL + t * top
            end = BL + t * bottom
            widths.append(float(np.linalg.norm(end - start)))

    gap = float(np.mean(widths))
    if gap <= 0:
        qa.append("Computed mean width is non-positive; check point ordering and marker detection.")
    if widths:
        qa.append(f"Profile width range: {min(widths):.2f}–{max(widths):.2f} mm")

    return MeasurementResult(gap_mm=gap, qa_notes=qa)
