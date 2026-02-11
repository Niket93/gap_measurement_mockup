"use client";

import { Button } from "@/components/ui/Button";
import { normalizeImageFileToDataUrl } from "@/lib/image/exif";

export function FileFallbackInput({
    onPicked
}: {
    onPicked: (dataUrl: string) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-sm text-zinc-600 dark:text-zinc-300">
                No camera? Upload a photo:
            </label>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                className="block w-full text-sm"
                onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const dataUrl = await normalizeImageFileToDataUrl(f);
                    onPicked(dataUrl);
                }}
            />
            <div className="text-xs text-zinc-500">
                Tip: use good lighting and keep the ArUco markers sharp.
            </div>
            <Button
                type="button"
                variant="ghost"
                onClick={() => {
                    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
                    input?.click();
                }}
            >
                Choose file
            </Button>
        </div>
    );
}
