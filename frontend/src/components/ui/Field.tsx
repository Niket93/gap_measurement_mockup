import { cn } from "@/lib/utils/cn";

export function Field({
  label,
  children,
  hint,
  className
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <div className="text-sm text-white/75">{label}</div>
      {children}
      {hint ? <div className="text-xs text-white/55">{hint}</div> : null}
    </label>
  );
}
