"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/shell/AppShell";
import { TopAppBar } from "@/components/shell/TopAppBar";
import { Tile } from "@/components/ui/Tile";
import { Toast } from "@/components/ui/Toast";
import { Collapse } from "@/components/ui/Collapse";
import { useAuthStore } from "@/lib/auth/authStore";
import { useInspectionStore } from "@/lib/inspections/store";
import { INTERIOR_TASKS } from "@/lib/demo/constants";

export default function InspectionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const auth = useAuthStore();
  const hydrate = useInspectionStore((state) => state.hydrate);
  const getById = useInspectionStore((state) => state.getById);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [showInterior, setShowInterior] = useState(false);
  const [showExterior, setShowExterior] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const item = getById(id);

  function comingSoon(feature: string) {
    setToastMsg(`${feature}: functionality coming soon.`);
    setToastOpen(true);
  }

  return (
    <RequireAuth>
      <AppShell>
        <TopAppBar
          title="Inspection"
          subtitle={item ? `${item.aircraftNo} • ${item.aircraftType} • ${item.phase}` : "Loading…"}
          userName={auth.fullName}
          onBack={() => router.push("/dashboard")}
          onLogout={() => {
            auth.logout();
            router.replace("/login");
          }}
        />

        <div className="max-w-6xl mx-auto px-6 pb-10 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Tile
              title="Interior Inspection"
              subtitle="Steps & Gaps, Colour Mismatch, Wood, Seats"
              onClick={() => {
                setShowInterior((v) => !v);
                setShowExterior(false);
              }}
            />
            <Tile
              title="External Inspection"
              subtitle="Exterior inspection tasks"
              onClick={() => {
                setShowExterior((v) => !v);
                setShowInterior(false);
              }}
            />
          </div>

          <Collapse open={showInterior} className="mt-5">
            <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">Interior Inspection</div>
                  <div className="text-sm text-white/65 mt-1">
                    Select a task to continue
                  </div>
                </div>
                <button
                  className="text-sm text-white/70 hover:text-white transition underline underline-offset-4"
                  onClick={() => setShowInterior(false)}
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {INTERIOR_TASKS.map((t) => (
                  <Tile
                    key={t.key}
                    title={t.title}
                    subtitle={t.subtitle}
                    onClick={() => {
                      if (t.key === "steps_gaps") router.push(`/inspections/${id}/steps-gaps`);
                      else comingSoon(t.title);
                    }}
                  />
                ))}
              </div>
            </div>
          </Collapse>

          <Collapse open={showExterior} className="mt-5">
            <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">External Inspection</div>
                  <div className="text-sm text-white/65 mt-1">
                    Select a task to continue
                  </div>
                </div>
                <button
                  className="text-sm text-white/70 hover:text-white transition underline underline-offset-4"
                  onClick={() => setShowExterior(false)}
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Tile title="External Walkaround" subtitle="Visual inspection" onClick={() => comingSoon("External Walkaround")} />
                <Tile title="Surface / Paint Checks" subtitle="Surface condition checks" onClick={() => comingSoon("Surface / Paint Checks")} />
                <Tile title="Doors & Panels" subtitle="Panel alignment checks" onClick={() => comingSoon("Doors & Panels")} />
                <Tile title="Landing Gear" subtitle="Component inspection" onClick={() => comingSoon("Landing Gear")} />
              </div>
            </div>
          </Collapse>

          {item?.defects?.length ? (
            <div className="mt-10 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-6">
              <div className="text-lg font-semibold">Registered Defects</div>
              <div className="mt-3 space-y-3">
                {item.defects.map((d) => (
                  <div key={d.id} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">Defect</div>
                      <div className="text-xs text-white/55">
                        {new Date(d.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-white/75">
                      Gap: <span className="font-semibold">{d.measurement_mm.toFixed(3)} mm</span>
                    </div>
                    <div className="mt-1 text-sm text-white/60">{d.note}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <Toast open={toastOpen} message={toastMsg} onClose={() => setToastOpen(false)} />
        </div>
      </AppShell>
    </RequireAuth>
  );
}
