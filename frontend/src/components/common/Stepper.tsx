import { cn } from "@/lib/utils/cn";

export function Stepper({
    steps,
    currentIndex
}: {
    steps: string[];
    currentIndex: number;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            {steps.map((s, i) => {
                const active = i === currentIndex;
                const done = i < currentIndex;
                return (
                    <div key={s} className="flex-1">
                        <div
                            className={cn(
                                "h-2 rounded-full transition",
                                done
                                    ? "bg-zinc-900 dark:bg-zinc-50"
                                    : active
                                        ? "bg-zinc-400 dark:bg-zinc-600"
                                        : "bg-zinc-200 dark:bg-zinc-800"
                            )}
                            aria-hidden
                        />
                        <div
                            className={cn(
                                "mt-2 text-xs",
                                active ? "text-zinc-900 dark:text-zinc-50 font-medium" : "text-zinc-500"
                            )}
                        >
                            {s}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
