from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Tuple
import json
import numpy as np
import cv2

from app.services.aruco_detect import MarkerDetection, select_best_marker, marker_score

@dataclass
class HomographyResult:
    H_pix_to_mm: np.ndarray
    H_mm_to_pix: np.ndarray
    mode_used: str
    used_marker_id: int
    reproj_rms_mm: float
    reproj_max_mm: float
    cond_number: float
    qa_pass: bool
    qa_confidence: str
    qa_reasons: List[str]
    inlier_corr: int
    total_corr: int

def _apply_homography_points(H: np.ndarray, pts: np.ndarray) -> np.ndarray:
    pts = np.asarray(pts, dtype=np.float64).reshape(-1, 2)
    pts_h = np.hstack([pts, np.ones((pts.shape[0], 1), dtype=np.float64)])
    proj = (H @ pts_h.T).T
    w = proj[:, 2:3]
    out = proj[:, 0:2] / w
    if not np.isfinite(out).all():
        raise ValueError("Invalid homography projection")
    return out

def _load_board_layout(path: str) -> Dict[int, Dict[str, float]]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    markers = data.get("markers", {})
    out: Dict[int, Dict[str, float]] = {}
    for k, v in markers.items():
        out[int(k)] = {
            "x_mm": float(v["x_mm"]),
            "y_mm": float(v["y_mm"]),
            "rotation_deg": float(v.get("rotation_deg", 0.0)),
        }
    return out

def _rot2d(theta_rad: float) -> np.ndarray:
    c = float(np.cos(theta_rad))
    s = float(np.sin(theta_rad))
    return np.array([[c, -s], [s, c]], dtype=np.float64)

def _marker_corners_mm(x_mm: float, y_mm: float, L_mm: float, rotation_deg: float) -> np.ndarray:
    local = np.array([[0.0, 0.0], [L_mm, 0.0], [L_mm, L_mm], [0.0, L_mm]], dtype=np.float64)
    R = _rot2d(np.deg2rad(rotation_deg))
    return (local @ R.T) + np.array([x_mm, y_mm], dtype=np.float64)

def qa_homography(cond_number: float, reproj_rms_mm: float, reproj_max_mm: float,
                  max_cond_number: float, catastrophic_rms_mm: float, catastrophic_cond: float,
                  multi: bool) -> Tuple[bool, str, List[str]]:
    reasons: List[str] = []

    if not np.isfinite(cond_number):
        reasons.append("Homography conditioning is non-finite.")
    elif cond_number > max_cond_number:
        reasons.append(f"High homography condition number: {cond_number:.3g}")

    if reproj_rms_mm > 1.0:
        reasons.append(f"Reprojection RMS elevated: {reproj_rms_mm:.3f} mm")
    if reproj_max_mm > 3.0:
        reasons.append(f"Reprojection max elevated: {reproj_max_mm:.3f} mm")

    catastrophic = False
    if reproj_rms_mm > catastrophic_rms_mm:
        catastrophic = True
        reasons.append("Catastrophic reprojection RMS.")
    if cond_number > catastrophic_cond:
        catastrophic = True
        reasons.append("Catastrophic homography conditioning.")

    if catastrophic:
        return False, "LOW", reasons

    if multi and len(reasons) == 0:
        return True, "HIGH", reasons
    if (not multi) and len(reasons) == 0:
        return True, "MEDIUM", reasons
    return True, "LOW", reasons

def compute_homography(
    detections: List[MarkerDetection],
    board_layout_path: str,
    L_multi_mm: float,
    L_single_mm: float,
    ransac_thresh_px: float,
    max_cond_number: float,
    catastrophic_rms_mm: float,
    catastrophic_cond: float,
    img_w: int,
    img_h: int,
) -> HomographyResult:
    board_map = _load_board_layout(board_layout_path)
    allowed_ids = set(board_map.keys())
    dets = [d for d in detections if d.marker_id in allowed_ids] or detections

    # Prefer multi-marker with known board layout
    multi_candidates = [d for d in dets if d.marker_id in allowed_ids]
    if len(multi_candidates) >= 2:
        img_pts_all: List[np.ndarray] = []
        mm_pts_all: List[np.ndarray] = []
        used_candidates: List[MarkerDetection] = []

        for d in multi_candidates:
            info = board_map[d.marker_id]
            mm_corners = _marker_corners_mm(info["x_mm"], info["y_mm"], L_multi_mm, info["rotation_deg"])
            img_corners = d.corners_refined.astype(np.float64)
            img_pts_all.append(img_corners)
            mm_pts_all.append(mm_corners)
            used_candidates.append(d)

        img_pts = np.vstack(img_pts_all).reshape(-1, 2)
        mm_pts = np.vstack(mm_pts_all).reshape(-1, 2)
        total_corr = int(img_pts.shape[0])

        H, mask = cv2.findHomography(
            img_pts, mm_pts,
            method=cv2.RANSAC,
            ransacReprojThreshold=float(ransac_thresh_px),
        )
        if H is not None and mask is not None and np.isfinite(H).all():
            H = H.astype(np.float64)
            Hinv = np.linalg.inv(H)
            inlier_mask = mask.ravel().astype(bool)
            inlier_corr = int(np.sum(inlier_mask))
            if inlier_corr >= 8:
                reproj_mm = _apply_homography_points(H, img_pts[inlier_mask])
                err = np.linalg.norm(reproj_mm - mm_pts[inlier_mask], axis=1)
                rms = float(np.sqrt(np.mean(err * err)))
                mx = float(np.max(err))
                cond = float(np.linalg.cond(H)) if np.isfinite(H).all() else float("inf")

                used_sorted = sorted(used_candidates, key=lambda d: -marker_score(d, img_w, img_h))
                used_marker_id = used_sorted[0].marker_id

                qa_pass, qa_conf, qa_reasons = qa_homography(
                    cond, rms, mx,
                    max_cond_number=max_cond_number,
                    catastrophic_rms_mm=catastrophic_rms_mm,
                    catastrophic_cond=catastrophic_cond,
                    multi=True
                )

                return HomographyResult(
                    H_pix_to_mm=H,
                    H_mm_to_pix=Hinv,
                    mode_used="multi_marker",
                    used_marker_id=int(used_marker_id),
                    reproj_rms_mm=rms,
                    reproj_max_mm=mx,
                    cond_number=cond,
                    qa_pass=qa_pass,
                    qa_confidence=qa_conf,
                    qa_reasons=qa_reasons,
                    inlier_corr=inlier_corr,
                    total_corr=total_corr,
                )

    # Fallback: single-marker (best quality marker)
    best = select_best_marker(dets, img_w, img_h)
    img_pts = best.corners_refined.astype(np.float64)
    mm_pts = np.array([[0.0, 0.0], [L_single_mm, 0.0], [L_single_mm, L_single_mm], [0.0, L_single_mm]], dtype=np.float64)

    H, _ = cv2.findHomography(img_pts, mm_pts, method=0)
    if H is None or not np.isfinite(H).all():
        raise ValueError("Failed to compute homography from single marker")

    H = H.astype(np.float64)
    Hinv = np.linalg.inv(H)

    reproj = _apply_homography_points(H, img_pts)
    err = np.linalg.norm(reproj - mm_pts, axis=1)
    rms = float(np.sqrt(np.mean(err * err)))
    mx = float(np.max(err))
    cond = float(np.linalg.cond(H)) if np.isfinite(H).all() else float("inf")

    qa_pass, qa_conf, qa_reasons = qa_homography(
        cond, rms, mx,
        max_cond_number=max_cond_number,
        catastrophic_rms_mm=catastrophic_rms_mm,
        catastrophic_cond=catastrophic_cond,
        multi=False
    )

    return HomographyResult(
        H_pix_to_mm=H,
        H_mm_to_pix=Hinv,
        mode_used="single_marker",
        used_marker_id=int(best.marker_id),
        reproj_rms_mm=rms,
        reproj_max_mm=mx,
        cond_number=cond,
        qa_pass=qa_pass,
        qa_confidence=qa_conf,
        qa_reasons=qa_reasons,
        inlier_corr=4,
        total_corr=4,
    )
