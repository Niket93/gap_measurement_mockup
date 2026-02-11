"use client";

import { Button } from "@/components/ui/Button";

export function ImageConfirm({
    image,
    onBack,
    onConfirm
}: {
    image: string;
    onBack: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Captured photo preview" className="w-full h-auto object-contain max-h-[65vh]" />
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={onBack}>Retake</Button>
                <Button onClick={onConfirm}>Looks Good</Button>
            </div>
        </div>
    );
}
