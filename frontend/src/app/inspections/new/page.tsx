"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/shell/AppShell";
import { TopAppBar } from "@/components/shell/TopAppBar";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuthStore } from "@/lib/auth/authStore";
import { useInspectionStore } from "@/lib/inspections/store";
import { AIRCRAFT_TYPES, FLIGHT_PHASES, MAJOR_CATEGORIES } from "@/lib/demo/constants";
import type { AircraftType, FlightPhase, MajorCategory } from "@/lib/inspections/types";

export default function NewInspectionPage() {
  const router = useRouter();
  const auth = useAuthStore();
  const hydrate = useInspectionStore((state) => state.hydrate);
  const createInspection = useInspectionStore((state) => state.createInspection);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const [aircraftNo, setAircraftNo] = useState("");
  const [aircraftType, setAircraftType] = useState<AircraftType>(AIRCRAFT_TYPES[0]);
  const [phase, setPhase] = useState<FlightPhase>(FLIGHT_PHASES[0]);
  const [majorCategory, setMajorCategory] = useState<MajorCategory>(MAJOR_CATEGORIES[0]);

  return (
    <RequireAuth>
      <AppShell>
        <TopAppBar
          title="New Inspection"
          subtitle="Enter Aircraft Details to Begin!"
          userName={auth.fullName}
          onBack={() => router.push("/dashboard")}
          onLogout={() => {
            auth.logout();
            router.replace("/login");
          }}
        />

        <div className="max-w-3xl mx-auto px-6 pb-10 pt-6">
          <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-8 space-y-5">
            <Field label="Aircraft No">
              <Input
                value={aircraftNo}
                onChange={(e) => setAircraftNo(e.target.value)}
                placeholder="Enter Aircraft No"
              />
            </Field>

            <Field label="Aircraft Type">
              <Select value={aircraftType} onChange={(e) => setAircraftType(e.target.value as AircraftType)}>
                {AIRCRAFT_TYPES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Phase">
                <Select value={phase} onChange={(e) => setPhase(e.target.value as FlightPhase)}>
                  {FLIGHT_PHASES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Category">
                <Select
                  value={majorCategory}
                  onChange={(e) => setMajorCategory(e.target.value as MajorCategory)}
                >
                  {MAJOR_CATEGORIES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="pt-2 flex gap-2">
              <Button variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const created = createInspection({
                    aircraftNo: aircraftNo.trim() || "UNKNOWN",
                    aircraftType,
                    phase,
                    majorCategory,
                    createdByEmail: auth.email!
                  });
                  router.push(`/inspections/${created.id}`);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
