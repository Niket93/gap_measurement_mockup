from __future__ import annotations

import json
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from app.schemas.measure import MeasureResponse, Point, GapMeasurement
from app.services.image_io import decode_image_upload
from app.services.aruco_detect import detect_aruco_markers, select_best_marker, build_marker_detections
from app.services.homography import compute_homography
from app.services.measurement import measure_gap_mm
from app.services.annotate import render_annotated_png_base64
from app.services.gap_detection import detect_gaps
from app.core.config import settings
from app.core.logging import get_logger

router = APIRouter()
log = get_logger("measure")

@router.post("/measure", response_model=MeasureResponse)
async def measure(
    image: UploadFile = File(...),
    mode: str = Form(...),
    points_json: str | None = Form(None),
):
    if mode not in ("2", "4", "auto"):
        raise HTTPException(status_code=400, detail="mode must be '2', '4', or 'auto'")

    points: list[Point] = []
    if mode in ("2", "4"):
        if points_json is None:
            raise HTTPException(status_code=400, detail="points_json is required for manual modes")
        try:
            pts_raw = json.loads(points_json)
            points = [Point(**p) for p in pts_raw]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid points_json")

        needed = 2 if mode == "2" else 4
        if len(points) != needed:
            raise HTTPException(status_code=400, detail=f"Expected exactly {needed} points")

    bgr = decode_image_upload(await image.read())
    h_img, w_img = bgr.shape[:2]

    gray, corners, ids = detect_aruco_markers(bgr, settings.aruco_dict)
    dets = build_marker_detections(
        gray=gray,
        corners=corners,
        ids=ids,
        min_area=settings.min_marker_pixel_area,
        min_laplacian=settings.min_laplacian_var,
    )

    if not dets:
        raise HTTPException(status_code=422, detail="No usable ArUco markers detected (sharpness/size too low).")

    hom = compute_homography(
        detections=dets,
        board_layout_path=settings.board_layout_path,
        L_multi_mm=settings.marker_length_multi_mm,
        L_single_mm=settings.marker_length_single_mm,
        ransac_thresh_px=settings.ransac_reproj_thresh_px,
        max_cond_number=settings.max_cond_number,
        catastrophic_rms_mm=settings.catastrophic_rms_mm,
        catastrophic_cond=settings.catastrophic_cond,
        img_w=w_img,
        img_h=h_img,
    )

    if not hom.qa_pass:
        # Return annotated image + QA notes, but block measurement
        annotated = render_annotated_png_base64(
            bgr=bgr,
            detections=dets,
            hom=hom,
            points_px=[(int(round(p.x)), int(round(p.y))) for p in points],
            measurement_mm=None,
            extra_notes=["Homography QA failed; measurement refused."]
        )
        return MeasureResponse(
            measurement_mm=0.0,
            confidence="LOW",
            qa_notes=hom.qa_reasons + ["Homography QA failed; measurement refused."],
            annotated_image_base64_png=annotated
        )

    if mode == "auto":
        detection = detect_gaps(bgr)
        if not detection.quads:
            raise HTTPException(status_code=422, detail="No gaps detected.")

        measurements: list[GapMeasurement] = []
        gap_quads_px: list[list[tuple[int, int]]] = []
        for quad in detection.quads:
            quad_points = [Point(x=float(p[0]), y=float(p[1])) for p in quad.points]
            result = measure_gap_mm(hom.H_pix_to_mm, quad_points, mode="4", profile_step_mm=settings.profile_step_mm)
            widths = result.widths_mm or []
            gap_mm = float(max(widths)) if widths else float(result.gap_mm)
            measurements.append(GapMeasurement(gap_mm=gap_mm, points_px=quad_points, widths_mm=widths))
            gap_quads_px.append(quad.points)

        measurement_mm = max(m.gap_mm for m in measurements)
        qa_notes = []
        qa_notes.extend(hom.qa_reasons)
        qa_notes.append(f"Auto-detected gaps: {len(measurements)}")

        annotated = render_annotated_png_base64(
            bgr=bgr,
            detections=dets,
            hom=hom,
            points_px=[],
            measurement_mm=measurement_mm,
            extra_notes=qa_notes,
            gap_quads=gap_quads_px,
        )

        return MeasureResponse(
            measurement_mm=float(measurement_mm),
            confidence=hom.qa_confidence,
            qa_notes=qa_notes,
            annotated_image_base64_png=annotated,
            measurements=measurements,
        )

    measurement = measure_gap_mm(hom.H_pix_to_mm, points, mode=mode, profile_step_mm=settings.profile_step_mm)

    annotated = render_annotated_png_base64(
        bgr=bgr,
        detections=dets,
        hom=hom,
        points_px=[(int(round(p.x)), int(round(p.y))) for p in points],
        measurement_mm=measurement.gap_mm,
        extra_notes=measurement.qa_notes
    )

    qa_notes = []
    qa_notes.extend(hom.qa_reasons)
    qa_notes.extend(measurement.qa_notes)

    return MeasureResponse(
        measurement_mm=float(measurement.gap_mm),
        confidence=hom.qa_confidence,
        qa_notes=qa_notes,
        annotated_image_base64_png=annotated,
        measurements=[
            GapMeasurement(
                gap_mm=float(measurement.gap_mm),
                points_px=points,
                widths_mm=measurement.widths_mm,
            )
        ],
    )
