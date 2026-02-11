import "./globals.css";
import type { Metadata } from "next";
import { AppHeader } from "@/components/common/AppHeader";

export const metadata: Metadata = {
    title: "Steps & Gaps",
    description: "Measure gaps using ArUco markers."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <div className="min-h-dvh flex flex-col">
                    <AppHeader />
                    <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
                        {children}
                    </main>
                    <footer className="px-4 py-6 text-center text-xs text-zinc-500">
                        Steps & Gaps • Digital Transformation Team
                    </footer>
                </div>
            </body>
        </html>
    );
}
