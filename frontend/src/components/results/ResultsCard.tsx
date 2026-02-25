"use client";

import { Button } from "@/components/ui/Button";
import { AnnotatedImage } from "@/components/results/AnnotatedImage";
import type { MeasureResponse } from "@/lib/api/types";

export function ResultsCard({
    result,
    isDefect,
    defectThresholdMm,
    onRegisterDefect,
    onMeasureAnother,
    mmFormatter
}: {
    result: MeasureResponse;
    isDefect: boolean;
    defectThresholdMm: number;
    onRegisterDefect: (measurementMm: number) => void;
    onMeasureAnother: () => void;
    mmFormatter: (v: number) => string;
}) {
    const maxGap = result.measurements?.length
        ? Math.max(...result.measurements.map((m) => m.gap_mm))
        : result.measurement_mm;
    return (
        <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-white/60">Measured gap</div>
                    <span
                        className={
                            isDefect
                                ? "inline-flex items-center gap-1 rounded-full border border-red-300/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-200"
                                : "inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200"
                        }
                    >
                        <span
                            className={isDefect ? "size-1.5 rounded-full bg-red-200" : "size-1.5 rounded-full bg-emerald-200"}
                            aria-hidden
                        />
                        {isDefect ? "DEFECT" : "OK"}
                    </span>
                </div>

                <div
                    className={
                        "text-4xl font-semibold tracking-tight mt-1 " +
                        (isDefect ? "text-red-200" : "text-emerald-200")
                    }
                >
                    {mmFormatter(maxGap)}
                </div>
                <div className="mt-2 text-sm text-white/70">
                    Confidence: <span className="font-medium text-white/90">{result.confidence}</span>
                </div>
                <div className="mt-2 text-xs text-white/55">
                    Defect if gap &gt; {defectThresholdMm} mm
                </div>

                {result.qa_notes?.length ? (
                    <div className="mt-4">
                        <div className="text-xs text-white/60">QA notes</div>
                        <ul className="text-sm list-disc pl-5 mt-1 space-y-1 text-white/80">
                            {result.qa_notes.map((n, i) => (
                                <li key={i}>{n}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {result.measurements?.length ? (
                    <div className="mt-4">
                        <div className="text-xs text-white/60">Detected gaps</div>
                        <ul className="text-sm list-disc pl-5 mt-1 space-y-1 text-white/80">
                            {result.measurements.map((m, i) => (
                                <li key={i}>
                                    Gap {i + 1}: {mmFormatter(m.gap_mm)}
                                    {m.widths_mm?.length
                                        ? ` (samples: ${m.widths_mm.length}, min: ${mmFormatter(Math.min(...m.widths_mm))}, max: ${mmFormatter(Math.max(...m.widths_mm))})`
                                        : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                    {isDefect ? (
                        <>
                            <Button
                                onClick={() => {
                                    onRegisterDefect(maxGap);
                                }}
                            >
                                Register Defect &amp; Send to eSnag!
                            </Button>
                            <Button variant="secondary" onClick={onMeasureAnother}>
                                Capture another
                            </Button>
                        </>
                    ) : (
                        <Button onClick={onMeasureAnother}>Capture another</Button>
                    )}
                </div>
            </div>

            <AnnotatedImage base64Png={result.annotated_image_base64_png} />
        </div>
    );
}
