import type { MeasureResponse, Point, PointMode } from "@/lib/api/types";

const API_BASE =
    (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/+$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");

function dataUrlToBlob(dataUrl: string): Blob {
    const [meta, b64] = dataUrl.split(",");
    const mime = meta.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
}

export async function measureGap(opts: {
    imageDataUrl: string;
    mode: PointMode | "auto";
    points?: Point[];
}): Promise<MeasureResponse> {
    const form = new FormData();
    form.append("image", dataUrlToBlob(opts.imageDataUrl), "capture.jpg");
    form.append("mode", opts.mode);
    form.append("points_json", JSON.stringify(opts.points ?? []));

    const res = await fetch(`${API_BASE}/measure`, {
        method: "POST",
        body: form
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Backend error (${res.status}): ${text || res.statusText}`);
    }

    return (await res.json()) as MeasureResponse;
}
