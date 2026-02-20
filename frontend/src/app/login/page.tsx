"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/lib/auth/authStore";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuthStore();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="min-h-dvh grid place-items-center px-6">
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-8">
          <div className="flex items-center gap-3">
            <img
              src="/assets/bombardier-logo.svg"
              alt="Bombardier"
              className="h-8 w-auto opacity-95"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
            <div>
              <div className="text-xl font-semibold">Sign in</div>
              <div className="text-xs text-white/60">Secure Access</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Field label="Email">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="first.last@aero.bombardier.com"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </Field>

            <Field label="Password">
              <Input
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="••••••••"
                type="password"
              />
            </Field>

            {err && (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-white">
                {err}
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => {
                const res = auth.login(email, pwd);
                if (!res.ok) {
                  setErr(res.error);
                  return;
                }
                router.replace("/dashboard");
              }}
            >
              Login
            </Button>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
