import numpy as np

def test_homography_cond_finite():
    H = np.eye(3)
    assert np.isfinite(np.linalg.cond(H))
