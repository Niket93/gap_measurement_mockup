from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple
import cv2
import numpy as np

@dataclass
class MarkerDetection:
    marker_id: int
    corners_refined: np.ndarray  # (4,2) float32
    pixel_area: float
    laplacian_var: float
    center: Tuple[float, float]

def _aruco_dict(name: str):
    # Map env string to cv2 constant
    name = name.strip()
    if not name.startswith("DICT_"):
        name = "DICT_4X4_50"
    dict_id = getattr(cv2.aruco, name, cv2.aruco.DICT_4X4_50)
    return cv2.aruco.getPredefinedDictionary(dict_id)

def detect_aruco_markers(bgr: np.ndarray, dict_name: str):
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    aruco_dict = _aruco_dict(dict_name)
    params = cv2.aruco.DetectorParameters()
    detector = cv2.aruco.ArucoDetector(aruco_dict, params)
    corners, ids, _rejected = detector.detectMarkers(gray)
    return gray, corners, ids

def _polygon_area(pts: np.ndarray) -> float:
    x = pts[:, 0]
    y = pts[:, 1]
    return 0.5 * float(np.abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1))))

def _laplacian_var(gray: np.ndarray, corners: np.ndarray) -> float:
    h, w = gray.shape[:2]
    xs = corners[:, 0]
    ys = corners[:, 1]
    x0 = max(0, int(np.floor(xs.min())) - 4)
    x1 = min(w, int(np.ceil(xs.max())) + 4)
    y0 = max(0, int(np.floor(ys.min())) - 4)
    y1 = min(h, int(np.ceil(ys.max())) + 4)
    roi = gray[y0:y1, x0:x1]
    if roi.size < 16:
        return 0.0
    lap = cv2.Laplacian(roi, cv2.CV_64F)
    return float(lap.var())

def _refine_corners(gray: np.ndarray, corners_list: List[np.ndarray]) -> List[np.ndarray]:
    refined: List[np.ndarray] = []
    term = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, 0.001)
    for c in corners_list:
        pts = c.reshape(-1, 2).astype(np.float32)
        edges = np.linalg.norm(np.roll(pts, -1, axis=0) - pts, axis=1)
        side_px = float(np.mean(edges))
        win = max(3, int(round(side_px * 0.08)))
        win = min(15, win)
        cv2.cornerSubPix(gray, pts.reshape(-1, 1, 2), (win, win), (-1, -1), term)
        refined.append(pts.reshape(4, 2).copy())
    return refined

def build_marker_detections(
    gray: np.ndarray,
    corners: List[np.ndarray],
    ids: Optional[np.ndarray],
    min_area: float,
    min_laplacian: float,
) -> List[MarkerDetection]:
    if ids is None or not corners:
        return []

    corners_raw = [c.reshape(4, 2).astype(np.float32) for c in corners]
    corners_refined = _refine_corners(gray, corners_raw)

    dets: List[MarkerDetection] = []
    for i, mid in enumerate(ids.flatten().tolist()):
        ref = corners_refined[i]
        area = _polygon_area(ref)
        if area < min_area:
            continue
        lap = _laplacian_var(gray, ref)
        if lap < min_laplacian:
            continue
        center = (float(ref[:, 0].mean()), float(ref[:, 1].mean()))
        dets.append(
            MarkerDetection(
                marker_id=int(mid),
                corners_refined=ref,
                pixel_area=float(area),
                laplacian_var=float(lap),
                center=center,
            )
        )
    return dets

def marker_score(d: MarkerDetection, img_w: int, img_h: int) -> float:
    area_term = np.log1p(d.pixel_area)
    sharp_term = np.log1p(max(0.0, d.laplacian_var))
    xs = d.corners_refined[:, 0]
    ys = d.corners_refined[:, 1]
    dist_to_border = min(float(xs.min()), float(ys.min()), float(img_w - 1 - xs.max()), float(img_h - 1 - ys.max()))
    border_term = np.log1p(max(0.0, dist_to_border))
    return float(2.0 * area_term + 1.0 * sharp_term + 0.5 * border_term)

def select_best_marker(detections: List[MarkerDetection], img_w: int, img_h: int) -> MarkerDetection:
    return sorted(detections, key=lambda d: -marker_score(d, img_w, img_h))[0]
