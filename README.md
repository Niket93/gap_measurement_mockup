# GapMeasure

Cross-device web app to measure a gap (mm) from a photo using ArUco markers.

# How it works

1. Capture photo or upload from file.

2. Confirm image.

3. Select 2 points (A→B) OR 4 points (TL→TR→BR→BL).

4. App sends image + points to backend.

5. Backend detects ArUco markers, computes pixel→mm homography, validates QA, measures gap, returns the result.