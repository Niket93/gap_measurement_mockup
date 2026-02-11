from __future__ import annotations

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os

class Settings(BaseSettings):
    # Camera apps will often run on a different port/origin
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

    # Board layout file path
    board_layout_path: str = Field(default="app/core/assets/board_layout.json")

    class Config:
        populate_by_name = True

settings = Settings()
