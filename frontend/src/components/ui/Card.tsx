import { cn } from "@/lib/utils/cn";

export function Card({
  title,
  children,
  className
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-sm",
        className
      )}
    >
      {title && (
        <header className="px-6 pt-6 pb-4 border-b border-white/10">
          <h2 className="text-base font-semibold text-white">{title}</h2>
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}