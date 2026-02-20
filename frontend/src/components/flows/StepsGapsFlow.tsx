"use client";

import { useMemo, useState } from "react";
import { Stepper } from "@/components/common/Stepper";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { ImageConfirm } from "@/components/image/ImageConfirm";
import { PointPicker } from "@/components/image/PointPicker";
import { ResultsCard } from "@/components/results/ResultsCard";
import { Toast } from "@/components/ui/Toast";
import { useFlowStore } from "@/lib/state/flowStore";
import { formatMm } from "@/lib/i18n/format";

export function StepsGapsFlow({
  defectThresholdMm = 3,
  onRegisterDefect,
  onBack
}: {
  defectThresholdMm?: number;
  onRegisterDefect: (measurementMm: number) => void;
  onBack: () => void;
}) {
  const flow = useFlowStore();
  const step = flow.step;

  const steps = useMemo(() => ["Capture", "Confirm", "Select Points", "Results"], []);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const isDefect = flow.result ? flow.result.measurement_mm > defectThresholdMm : false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/65">Steps &amp; Gaps Measurement</div>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      </div>

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
          <ImageConfirm image={flow.image} onBack={() => flow.resetToCapture()} onConfirm={() => flow.setStep(2)} />
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
        <div className="space-y-4">
          <ResultsCard
            result={flow.result}
            onMeasureAnother={() => flow.resetAll()}
            mmFormatter={formatMm}
          />

          <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-6">
            <div className="text-xs text-white/60">Classification</div>
            <div className="mt-1 text-2xl font-semibold">
              {isDefect ? (
                <span className="text-red-300">DEFECT</span>
              ) : (
                <span className="text-emerald-200">OK</span>
              )}
            </div>
            <div className="mt-2 text-sm text-white/65">
              Defect if gap &gt; {defectThresholdMm} mm
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {isDefect ? (
                <>
                  <Button
                    onClick={() => {
                      onRegisterDefect(flow.result!.measurement_mm);
                      setToastMsg("Defect registered and sent to eSnag.");
                      setToastOpen(true);
                    }}
                  >
                    Register defect &amp; send to eSnag
                  </Button>
                  <Button variant="secondary" onClick={() => flow.resetAll()}>
                    Capture another
                  </Button>
                </>
              ) : (
                <Button onClick={() => flow.resetAll()}>Capture another</Button>
              )}
            </div>
          </div>
        </div>
      )}

      {flow.error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-white">
          <div className="font-semibold">Something went wrong</div>
          <div className="text-sm mt-1 whitespace-pre-wrap text-white/80">{flow.error}</div>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => flow.clearError()}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <Toast open={toastOpen} message={toastMsg} onClose={() => setToastOpen(false)} tone="success" />
    </div>
  );
}
