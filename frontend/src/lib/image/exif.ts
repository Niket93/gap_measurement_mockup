import * as exifr from "exifr";

// Normalize EXIF orientation by decoding the file, applying rotation/mirroring, and returning a DataURL.
// This avoids backend surprises and keeps point coordinates consistent with what the user sees.
export async function normalizeImageFileToDataUrl(file: File): Promise<string> {
    const orientation = (await exifr.orientation(file).catch(() => 1)) as number | undefined;

    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    // EXIF orientation values: 1..8
    const o = orientation ?? 1;

    if (o > 4) {
        canvas.width = height;
        canvas.height = width;
    } else {
        canvas.width = width;
        canvas.height = height;
    }

    ctx.save();
    applyExifTransform(ctx, o, width, height);
    ctx.drawImage(bitmap, 0, 0);
    ctx.restore();

    return canvas.toDataURL("image/jpeg", 0.95);
}

function applyExifTransform(
    ctx: CanvasRenderingContext2D,
    orientation: number,
    width: number,
    height: number
) {
    switch (orientation) {
        case 2: // mirror horizontal
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            break;
        case 3: // rotate 180
            ctx.translate(width, height);
            ctx.rotate(Math.PI);
            break;
        case 4: // mirror vertical
            ctx.translate(0, height);
            ctx.scale(1, -1);
            break;
        case 5: // mirror horizontal + rotate 90 CW
            ctx.rotate(0.5 * Math.PI);
            ctx.scale(1, -1);
            break;
        case 6: // rotate 90 CW
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(0, -height);
            break;
        case 7: // mirror horizontal + rotate 90 CCW
            ctx.rotate(-0.5 * Math.PI);
            ctx.scale(1, -1);
            ctx.translate(-width, 0);
            break;
        case 8: // rotate 90 CCW
            ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-width, 0);
            break;
        default:
            break;
    }
}
