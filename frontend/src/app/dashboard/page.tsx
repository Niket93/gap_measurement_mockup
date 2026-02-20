"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/shell/AppShell";
import { TopAppBar } from "@/components/shell/TopAppBar";
import { useAuthStore } from "@/lib/auth/authStore";
import { useInspectionStore } from "@/lib/inspections/store";

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuthStore();
  const hydrate = useInspectionStore((state) => state.hydrate);
  const inspections = useInspectionStore((state) => state.inspections);

  const inspectionsByPhase = useMemo(() => {
    const groups = {
      "Pre-Flight": [] as typeof inspections,
      "In-Flight": [] as typeof inspections,
      "Post-Flight": [] as typeof inspections
    };

    inspections.forEach((inspection) => {
      groups[inspection.phase].push(inspection);
    });

    return groups;
  }, [inspections]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <RequireAuth>
      <AppShell>
        <TopAppBar
          title="Dashboard"
          subtitle="Inspection Sessions and History"
          userName={auth.fullName}
          onLogout={() => {
            auth.logout();
            router.replace("/login");
          }}
          rightSlot={
            <button
              className="hidden md:inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition active:scale-[0.99]"
              onClick={() => router.push("/inspections/new")}
            >
              Create New Inspection
            </button>
          }
        />

        <div className="max-w-6xl mx-auto px-6 pb-10 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {([
              { key: "Pre-Flight", icon: "/assets/pre-flight.png" },
              { key: "In-Flight", icon: "/assets/in-flight.png" },
              { key: "Post-Flight", icon: "/assets/post-flight.png" }
            ] as const).map((phase) => {
              const items = inspectionsByPhase[phase.key];

              return (
                <section key={phase.key} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={phase.icon}
                      alt={phase.key}
                      className="h-6 w-6 opacity-90"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="text-lg font-semibold">{phase.key}</div>
                  </div>

                  {items.length ? (
                    <div className="space-y-4">
                      {items.map((i) => {
                        const hasDefects = Boolean(i.defects?.length);

                        return (
                          <button
                            key={i.id}
                            onClick={() => router.push(`/inspections/${i.id}`)}
                            className="w-full text-left rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-6 hover:bg-white/10 transition active:scale-[0.99]"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-semibold text-white">{i.aircraftNo}</div>
                              <div className="flex items-center gap-2 text-xs text-white/60">
                                <span
                                  className={
                                    hasDefects
                                      ? "inline-flex items-center gap-1 rounded-full border border-red-300/30 bg-red-500/10 px-2 py-0.5 text-red-200"
                                      : "inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-200"
                                  }
                                >
                                  <span
                                    className={hasDefects ? "size-1.5 rounded-full bg-red-200" : "size-1.5 rounded-full bg-emerald-200"}
                                    aria-hidden
                                  />
                                  {hasDefects ? "Defect" : "OK"}
                                </span>
                                <span className="text-white/55">
                                  {new Date(i.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="mt-1 text-sm text-white/65">
                              {i.aircraftType} • {i.majorCategory}
                            </div>

                            {i.defects?.length ? (
                              <div className="mt-3 text-xs text-white/60">
                                Defects registered:{" "}
                                <span className="font-semibold text-white">{i.defects.length}</span>
                              </div>
                            ) : (
                              <div className="mt-3 text-xs text-white/45">No defects registered</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-white/55">No inspections yet.</div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </AppShell>
    </RequireAuth>
  );
}