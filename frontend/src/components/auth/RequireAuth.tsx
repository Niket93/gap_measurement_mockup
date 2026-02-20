"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/authStore";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAuthStore();

  useEffect(() => {
    if (!auth.email) router.replace("/");
  }, [auth.email, router]);

  if (!auth.email) return null;
  return <>{children}</>;
}
