import numpy as np
from app.services.measurement import measure_gap_mm
from app.schemas.measure import Point

def test_measure_2pt_identity():
    H = np.eye(3)
    res = measure_gap_mm(H, [Point(x=0, y=0), Point(x=3, y=4)], mode="2", profile_step_mm=50.0)
    assert abs(res.gap_mm - 5.0) < 1e-9
