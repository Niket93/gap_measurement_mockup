"use client";

import { cn } from "@/lib/utils/cn";
import { useEffect, useRef, useState } from "react";

export function Collapse({
  open,
  children,
  className
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Measure content for smooth height animation
    const measure = () => {
      const h = el.scrollHeight;
      setMaxH(h);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out overflow-hidden",
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none",
        className
      )}
      style={{ maxHeight: open ? maxH : 0 }}
      aria-hidden={!open}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}
