"use client";

import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

function getInitialTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("gm_theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

export function AppHeader() {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const t = getInitialTheme();
        setTheme(t);
        document.documentElement.classList.toggle("dark", t === "dark");
    }, []);

    function toggle() {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.classList.toggle("dark", next === "dark");
        window.localStorage.setItem("gm_theme", next);
    }

    return (
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-zinc-900 dark:bg-zinc-50" aria-hidden />
                    <div className="leading-tight">
                        <div className="font-semibold">Steps & Gaps</div>
                        <div className="text-xs text-zinc-500">Measures gaps using ArUco markers.</div>
                    </div>
                </div>
                <Button variant="secondary" onClick={toggle} aria-label="Toggle dark mode">
                    {theme === "dark" ? "Light" : "Dark"}
                </Button>
            </div>
        </header>
    );
}
