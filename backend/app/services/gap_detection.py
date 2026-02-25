from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List, Tuple
import ssl
import urllib.parse
import urllib.request

import cv2
import numpy as np
import torch
import segmentation_models_pytorch as smp
import certifi

from app.core.config import settings

NORMALIZE_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
NORMALIZE_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

@dataclass
class GapQuad:
    points: List[Tuple[int, int]]

@dataclass
class GapDetectionResult:
    quads: List[GapQuad]
    prob_map: np.ndarray
    mask: np.ndarray


def build_model(model_name: str, encoder: str) -> torch.nn.Module:
    name = model_name.lower()
    if name in {"unetpp", "unet++", "unetplusplus"}:
        return smp.UnetPlusPlus(
            encoder_name=encoder,
            encoder_weights=None,
            in_channels=3,
            classes=1,
            activation=None,
        )
    if name in {"deeplabv3plus", "deeplabv3+", "dlv3+"}:
        return smp.DeepLabV3Plus(
            encoder_name=encoder,
            encoder_weights=None,
            in_channels=3,
            classes=1,
            activation=None,
        )
    raise ValueError(f"Unknown model_name: {model_name}")


def load_checkpoint(model: torch.nn.Module, ckpt_path: Path, device: torch.device) -> None:
    ckpt = torch.load(ckpt_path, map_location=device)
    if isinstance(ckpt, dict) and "model" in ckpt:
        state = ckpt["model"]
    else:
        state = ckpt
    model.load_state_dict(state, strict=True)


def normalize_tile(tile_rgb: np.ndarray, mean: np.ndarray, std: np.ndarray) -> torch.Tensor:
    tile = tile_rgb.astype(np.float32) / 255.0
    tile = (tile - mean) / std
    tile = tile.transpose(2, 0, 1)
    return torch.from_numpy(tile).unsqueeze(0)


def tile_inference(
    model: torch.nn.Module,
    img_rgb: np.ndarray,
    tile_size: int,
    overlap: float,
    mean: np.ndarray,
    std: np.ndarray,
    device: torch.device,
) -> np.ndarray:
    h, w = img_rgb.shape[:2]
    tile_size = int(tile_size)
    overlap = float(overlap)
    stride = max(1, int(round(tile_size * (1.0 - overlap))))

    if h <= tile_size:
        n_h = 1
    else:
        n_h = int(np.ceil((h - tile_size) / stride)) + 1
    if w <= tile_size:
        n_w = 1
    else:
        n_w = int(np.ceil((w - tile_size) / stride)) + 1

    pad_h = max(0, (n_h - 1) * stride + tile_size - h)
    pad_w = max(0, (n_w - 1) * stride + tile_size - w)
    if pad_h > 0 or pad_w > 0:
        img_pad = cv2.copyMakeBorder(
            img_rgb,
            0,
            pad_h,
            0,
            pad_w,
            borderType=cv2.BORDER_REFLECT_101,
        )
    else:
        img_pad = img_rgb

    H, W = img_pad.shape[:2]
    accum = np.zeros((H, W), dtype=np.float32)
    count = np.zeros((H, W), dtype=np.float32)

    model.eval()
    with torch.no_grad():
        for y0 in range(0, H - tile_size + 1, stride):
            for x0 in range(0, W - tile_size + 1, stride):
                tile = img_pad[y0 : y0 + tile_size, x0 : x0 + tile_size]
                x = normalize_tile(tile, mean, std).to(device)
                logits = model(x)
                probs = torch.sigmoid(logits).squeeze(0).squeeze(0).cpu().numpy()
                accum[y0 : y0 + tile_size, x0 : x0 + tile_size] += probs
                count[y0 : y0 + tile_size, x0 : x0 + tile_size] += 1.0

    count = np.maximum(count, 1.0)
    prob_map = accum / count
    return prob_map[:h, :w]


def predict_prob_map(
    name: str,
    img_bgr: np.ndarray,
    encoder: str,
    tile_size: int,
    mean: np.ndarray,
    std: np.ndarray,
    ckpt_path: Path,
    overlap: float,
    device: torch.device,
) -> np.ndarray:
    model = build_model(str(name), str(encoder)).to(device)
    load_checkpoint(model, ckpt_path, device)

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    prob_map = tile_inference(model, img_rgb, tile_size, overlap, mean, std, device)
    return prob_map


def _clean_mask(mask: np.ndarray, kernel_size: int, iterations: int) -> np.ndarray:
    k = max(1, int(kernel_size))
    iters = max(0, int(iterations))
    if iters == 0:
        return mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    out = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=iters)
    out = cv2.morphologyEx(out, cv2.MORPH_CLOSE, kernel, iterations=iters)
    return out


def _normalize_github_url(url: str) -> str:
    if "github.com" in url and "/blob/" in url:
        parts = url.split("github.com/", 1)[1]
        parts = parts.replace("/blob/", "/", 1)
        return "https://raw.githubusercontent.com/" + parts
    return url


def _download_file(url: str, dst_path: Path) -> None:
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = dst_path.with_suffix(dst_path.suffix + ".tmp")
    # Use certifi CA bundle to avoid missing system certs in containers.
    context = ssl.create_default_context(cafile=certifi.where())
    with urllib.request.urlopen(url, context=context) as resp, open(tmp_path, "wb") as f:
        f.write(resp.read())
    tmp_path.replace(dst_path)


def _resolve_checkpoint(local_path: Path, url: str, cache_dir: Path) -> Path:
    if url:
        normalized = _normalize_github_url(url)
        filename = Path(urllib.parse.urlparse(normalized).path).name
        if not filename:
            filename = local_path.name
        cached = cache_dir / filename
        if not cached.exists():
            _download_file(normalized, cached)
        return cached
    return local_path


def _quads_from_mask(mask: np.ndarray, min_area_px: int, min_len_px: float, max_quads: int) -> List[GapQuad]:
    bin_mask = (mask > 0).astype(np.uint8)
    num, labels, stats, _ = cv2.connectedComponentsWithStats(bin_mask, connectivity=8)
    quads: List[GapQuad] = []

    candidates = []
    for label in range(1, num):
        area = int(stats[label, cv2.CC_STAT_AREA])
        if area < min_area_px:
            continue

        ys, xs = np.where(labels == label)
        if xs.size < 4:
            continue

        pts = np.column_stack([xs, ys]).astype(np.float32)
        rect = cv2.minAreaRect(pts)
        (w, h) = rect[1]
        if min(w, h) < float(min_len_px):
            continue

        box = cv2.boxPoints(rect)
        quad_pts = [(int(round(p[0])), int(round(p[1]))) for p in box]
        candidates.append((area, quad_pts))

    candidates.sort(key=lambda x: -x[0])
    for _area, quad_pts in candidates:
        quads.append(GapQuad(points=quad_pts))
        if max_quads > 0 and len(quads) >= max_quads:
            break

    return quads


def detect_gaps(img_bgr: np.ndarray) -> GapDetectionResult:
    device = torch.device(settings.gap_device) if settings.gap_device else torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    encoder = settings.gap_encoder
    tile_size = settings.gap_tile_size
    overlap = settings.gap_overlap

    cache_dir = Path(settings.gap_model_cache_dir)
    unet_ckpt = _resolve_checkpoint(
        Path(settings.gap_unetpp_ckpt).resolve(),
        settings.gap_unetpp_url,
        cache_dir,
    )
    dlv3_ckpt = _resolve_checkpoint(
        Path(settings.gap_dlv3_ckpt).resolve(),
        settings.gap_dlv3_url,
        cache_dir,
    )

    if settings.gap_use_fusion:
        unet_prob = predict_prob_map(
            "unetpp",
            img_bgr,
            encoder,
            tile_size,
            NORMALIZE_MEAN,
            NORMALIZE_STD,
            unet_ckpt,
            overlap,
            device,
        )
        dlv3_prob = predict_prob_map(
            "deeplabv3plus",
            img_bgr,
            encoder,
            tile_size,
            NORMALIZE_MEAN,
            NORMALIZE_STD,
            dlv3_ckpt,
            overlap,
            device,
        )
        w_unet = settings.gap_fusion_unetpp_weight
        w_dlv3 = settings.gap_fusion_dlv3_weight
        weight_sum = w_unet + w_dlv3
        if weight_sum <= 0:
            weight_sum = 1.0
        prob_map = (unet_prob * w_unet + dlv3_prob * w_dlv3) / weight_sum
        thr = settings.gap_fusion_thr
    else:
        prob_map = predict_prob_map(
            "unetpp",
            img_bgr,
            encoder,
            tile_size,
            NORMALIZE_MEAN,
            NORMALIZE_STD,
            unet_ckpt,
            overlap,
            device,
        )
        thr = settings.gap_unetpp_thr

    mask = (prob_map >= float(thr)).astype(np.uint8) * 255
    mask = _clean_mask(mask, settings.gap_morph_kernel, settings.gap_morph_iterations)
    quads = _quads_from_mask(
        mask,
        settings.gap_min_area_px,
        settings.gap_min_length_px,
        settings.gap_max_segments,
    )

    return GapDetectionResult(quads=quads, prob_map=prob_map, mask=mask)
