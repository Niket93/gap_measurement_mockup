from __future__ import annotations

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os

class Settings(BaseSettings):

    cors_allow_origins: List[str] = Field(default_factory=lambda: ["http://localhost:3000"])

    aruco_dict: str = Field(default="DICT_4X4_50", alias="GM_ARUCO_DICT")

    marker_length_multi_mm: float = Field(default=50.0, alias="GM_MARKER_LENGTH_MULTI_MM")
    marker_length_single_mm: float = Field(default=40.0, alias="GM_MARKER_LENGTH_SINGLE_MM")

    min_marker_pixel_area: float = Field(default=800.0, alias="GM_MIN_MARKER_PIXEL_AREA")
    min_laplacian_var: float = Field(default=40.0, alias="GM_MIN_LAPLACIAN_VAR")
    ransac_reproj_thresh_px: float = Field(default=3.0, alias="GM_RANSAC_REPROJ_THRESH_PX")

    max_cond_number: float = Field(default=1e7, alias="GM_MAX_COND_NUMBER")
    catastrophic_rms_mm: float = Field(default=5.0, alias="GM_CATASTROPHIC_RMS_MM")
    catastrophic_cond: float = Field(default=1e9, alias="GM_CATASTROPHIC_COND")

    profile_step_mm: float = Field(default=50.0, alias="GM_PROFILE_STEP_MM")

    # Gap auto-detection (model inference)
    gap_model_dir: str = Field(default="app/core/assets/models", alias="GM_GAP_MODEL_DIR")
    gap_unetpp_ckpt: str = Field(default="app/core/assets/models/unetpp.pt", alias="GM_UNETPP_CKPT")
    gap_dlv3_ckpt: str = Field(default="app/core/assets/models/deeplabv3.pt", alias="GM_DLV3_CKPT")
    gap_unetpp_url: str = Field(
        default="https://github.com/Niket93/gap_detection_cv_models/blob/main/deeplabv3.pt",
        alias="GM_UNETPP_URL",
    )
    gap_dlv3_url: str = Field(
        default="https://github.com/Niket93/gap_detection_cv_models/blob/main/unetpp.pt",
        alias="GM_DLV3_URL",
    )
    gap_model_cache_dir: str = Field(default="/app/models", alias="GM_GAP_MODEL_CACHE_DIR")
    gap_encoder: str = Field(default="timm-efficientnet-b1", alias="GM_GAP_ENCODER")
    gap_tile_size: int = Field(default=1024, alias="GM_GAP_TILE_SIZE")
    gap_overlap: float = Field(default=0.25, alias="GM_GAP_OVERLAP")
    gap_use_fusion: bool = Field(default=True, alias="GM_GAP_USE_FUSION")
    gap_unetpp_thr: float = Field(default=0.5, alias="GM_GAP_UNETPP_THR")
    gap_fusion_thr: float = Field(default=0.4, alias="GM_GAP_FUSION_THR")
    gap_fusion_unetpp_weight: float = Field(default=0.5, alias="GM_GAP_FUSION_UNETPP_WEIGHT")
    gap_fusion_dlv3_weight: float = Field(default=0.5, alias="GM_GAP_FUSION_DLV3_WEIGHT")
    gap_min_area_px: int = Field(default=400, alias="GM_GAP_MIN_AREA_PX")
    gap_min_length_px: float = Field(default=20.0, alias="GM_GAP_MIN_LENGTH_PX")
    gap_morph_kernel: int = Field(default=5, alias="GM_GAP_MORPH_KERNEL")
    gap_morph_iterations: int = Field(default=1, alias="GM_GAP_MORPH_ITERATIONS")
    gap_max_segments: int = Field(default=0, alias="GM_GAP_MAX_SEGMENTS")
    gap_device: str = Field(default="", alias="GM_GAP_DEVICE")

    # Board layout file path
    board_layout_path: str = Field(default="app/core/assets/board_layout.json")

    class Config:
        populate_by_name = True

settings = Settings()
