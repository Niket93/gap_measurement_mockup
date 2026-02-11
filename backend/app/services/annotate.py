from __future__ import annotations

import base64
import cv2
import numpy as np
from typing import List, Optional, Tuple
from app.services.aruco_detect import MarkerDetection
from app.services.homography import HomographyResult

def render_annotated_png_base64(
    bgr: np.ndarray,
    detections: List[MarkerDetection],
    hom: HomographyResult,
    points_px: List[Tuple[int, int]],
    measurement_mm: Optional[float],
    extra_notes: List[str],
) -> str:
    out = bgr.copy()

    # draw markers
    for d in detections:
        pts = d.corners_refined.astype(np.int32).reshape(-1, 1, 2)
        cv2.polylines(out, [pts], True, (0, 255, 255), 2)
        c = (int(d.center[0]), int(d.center[1]))
        cv2.putText(out, f"ID {d.marker_id}", (c[0] + 6, c[1] - 6),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2, cv2.LINE_AA)

    # draw points + geometry
    for i, p in enumerate(points_px):
        cv2.circle(out, p, 6, (0, 255, 0), -1)
        cv2.putText(out, str(i + 1), (p[0] + 8, p[1] - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 3, cv2.LINE_AA)
        cv2.putText(out, str(i + 1), (p[0] + 8, p[1] - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)

    if len(points_px) >= 2:
        cv2.line(out, points_px[0], points_px[1], (0, 0, 255), 2)
    if len(points_px) == 4:
        poly = np.array(points_px, dtype=np.int32).reshape(-1, 1, 2)
        cv2.polylines(out, [poly], True, (0, 0, 255), 2)

    # header text
    header = f"Mode: {hom.mode_used}  Confidence: {hom.qa_confidence}"
    cv2.putText(out, header, (16, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 4, cv2.LINE_AA)
    cv2.putText(out, header, (16, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 1, cv2.LINE_AA)

    if measurement_mm is not None:
        label = f"Gap: {measurement_mm:.3f} mm"
        cv2.putText(out, label, (16, 62), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 0), 4, cv2.LINE_AA)
        cv2.putText(out, label, (16, 62), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 1, cv2.LINE_AA)

    # QA notes (top few)
    y = 92
    notes = (hom.qa_reasons or []) + (extra_notes or [])
    for n in notes[:5]:
        cv2.putText(out, f"- {n}", (16, y), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 3, cv2.LINE_AA)
        cv2.putText(out, f"- {n}", (16, y), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1, cv2.LINE_AA)
        y += 22

    ok, buf = cv2.imencode(".png", out)
    if not ok:
        raise ValueError("Failed to encode annotated image")
    return base64.b64encode(buf.tobytes()).decode("ascii")
