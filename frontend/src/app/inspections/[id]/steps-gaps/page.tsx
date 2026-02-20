"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/shell/AppShell";
import { TopAppBar } from "@/components/shell/TopAppBar";
import { StepsGapsFlow } from "@/components/flows/StepsGapsFlow";
import { useInspectionStore } from "@/lib/inspections/store";

export default function StepsGapsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const hydrate = useInspectionStore((state) => state.hydrate);
  const getById = useInspectionStore((state) => state.getById);
  const addDefect = useInspectionStore((state) => state.addDefect);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const item = getById(id);

  return (
    <RequireAuth>
      <AppShell>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-5 md:p-6">
            {item ? (
              <div className="mb-4">
                <div className="text-xs text-white/60">Inspection</div>
                <div className="text-lg font-semibold text-white">
                  {item.aircraftNo} • {item.aircraftType} • {item.phase}
                </div>
              </div>
            ) : null}

            <StepsGapsFlow
              defectThresholdMm={3}
              onBack={() => router.push(`/inspections/${id}`)}
              onRegisterDefect={(measurementMm) => {
                addDefect(id, {
                  measurement_mm: measurementMm,
                  note: "Auto-registered from Steps & Gaps result."
                });
              }}
            />
          </div>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
