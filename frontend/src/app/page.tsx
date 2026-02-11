"use client";

import { useMemo } from "react";
import { Stepper } from "@/components/common/Stepper";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { ImageConfirm } from "@/components/image/ImageConfirm";
import { PointPicker } from "@/components/image/PointPicker";
import { ResultsCard } from "@/components/results/ResultsCard";
import { useFlowStore } from "@/lib/state/flowStore";
import { formatMm } from "@/lib/i18n/format";

export default function Page() {
    const flow = useFlowStore();
    const step = flow.step;

    const steps = useMemo(
        () => ["Capture", "Confirm", "Select Points", "Results"],
        []
    );

    return (
        <div className="space-y-4">
            <Stepper steps={steps} currentIndex={step} />

            {step === 0 && (
                <Card title="Capture">
                    <CameraCapture
                        onCaptured={(img) => {
                            flow.setImage(img);
                            flow.setStep(1);
                        }}
                    />
                </Card>
            )}

            {step === 1 && flow.image && (
                <Card title="Confirm">
                    <ImageConfirm
                        image={flow.image}
                        onBack={() => flow.resetToCapture()}
                        onConfirm={() => flow.setStep(2)}
                    />
                </Card>
            )}

            {step === 2 && flow.image && (
                <Card title="Select Points">
                    <PointPicker
                        image={flow.image}
                        mode={flow.pointMode}
                        setMode={flow.setPointMode}
                        points={flow.points}
                        setPoints={flow.setPoints}
                        onBack={() => flow.setStep(1)}
                        onSubmit={async () => {
                            await flow.submitMeasurement();
                        }}
                    />
                </Card>
            )}

            {step === 3 && flow.result && (
                <ResultsCard
                    result={flow.result}
                    onMeasureAnother={() => flow.resetAll()}
                    mmFormatter={formatMm}
                />
            )}

            {/* Global errors */}
            {flow.error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-300 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100 p-4"
                >
                    <div className="font-medium">Something went wrong</div>
                    <div className="text-sm mt-1 whitespace-pre-wrap">{flow.error}</div>
                    <div className="mt-3">
                        <Button variant="secondary" onClick={() => flow.clearError()}>
                            Dismiss
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}