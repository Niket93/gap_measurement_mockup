"use client";

import { cn } from "@/lib/utils/cn";

export function Tile({
  title,
  subtitle,
  onClick,
  icon
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  const hasIcon = Boolean(icon);

  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left rounded-[28px] border border-white/10 bg-white/5 backdrop-blur p-6 " +
          "hover:bg-white/10 transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
      )}
    >
      <div className={cn("flex items-start", hasIcon ? "gap-4" : "")}>
        {hasIcon ? (
          <div className="mt-0.5 size-11 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="text-lg font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm text-white/65">{subtitle}</div>
        </div>
      </div>
    </button>
  );
}
