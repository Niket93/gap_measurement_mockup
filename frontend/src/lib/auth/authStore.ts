"use client";

import { create } from "zustand";
import { parseNameFromEmail } from "./user";

type AuthState = {
  email: string | null;
  fullName: string | null;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  email: null,
  fullName: null,

  login: (email, password) => {
    const e = email.trim().toLowerCase();

    if (!e.endsWith("@aero.bombardier.com")) {
      return { ok: false, error: "Email must end with @aero.bombardier.com" };
    }
    if (password !== "DT@2025") {
      return { ok: false, error: "Invalid password" };
    }

    const { fullName } = parseNameFromEmail(e);
    set({ email: e, fullName });
    return { ok: true };
  },

  logout: () => set({ email: null, fullName: null })
}));
