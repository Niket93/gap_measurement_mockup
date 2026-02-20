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
                  ? "bg-white/80"
                  : active
                    ? "bg-white/35"
                    : "bg-white/10"
              )}
              aria-hidden
            />
            <div
              className={cn(
                "mt-2 text-xs",
                active ? "text-white font-semibold" : "text-white/60"
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