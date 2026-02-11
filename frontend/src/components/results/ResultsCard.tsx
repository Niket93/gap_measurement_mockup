"use client";

import { Button } from "@/components/ui/Button";
import { AnnotatedImage } from "@/components/results/AnnotatedImage";
import type { MeasureResponse } from "@/lib/api/types";

export function ResultsCard({
    result,
    onMeasureAnother,
    mmFormatter
}: {
    result: MeasureResponse;
    onMeasureAnother: () => void;
    mmFormatter: (v: number) => string;
}) {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
                <div className="text-xs text-zinc-500">Measured gap</div>
                <div className="text-4xl font-semibold tracking-tight mt-1">
                    {mmFormatter(result.measurement_mm)}
                </div>
                <div className="mt-2 text-sm">
                    Confidence:{" "}
                    <span className="font-medium">{result.confidence}</span>
                </div>
                {result.qa_notes?.length ? (
                    <div className="mt-3">
                        <div className="text-xs text-zinc-500">QA notes</div>
                        <ul className="text-sm list-disc pl-5 mt-1 space-y-1 text-zinc-700 dark:text-zinc-200">
                            {result.qa_notes.map((n, i) => (
                                <li key={i}>{n}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>

            <AnnotatedImage base64Png={result.annotated_image_base64_png} />

            <Button onClick={onMeasureAnother}>Measure another</Button>
        </div>
    );
}
