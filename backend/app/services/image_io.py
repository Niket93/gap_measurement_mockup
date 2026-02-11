from __future__ import annotations

import io
import numpy as np
import cv2
from PIL import Image, ImageOps

def decode_image_upload(data: bytes) -> np.ndarray:
    """
    Decode image bytes into BGR np.ndarray.
    Handles EXIF orientation via Pillow.
    """
    if not data:
        raise ValueError("Empty image payload")

    im = Image.open(io.BytesIO(data))
    im = ImageOps.exif_transpose(im)
    im = im.convert("RGB")
    arr = np.array(im, dtype=np.uint8)  # RGB
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    return bgr
