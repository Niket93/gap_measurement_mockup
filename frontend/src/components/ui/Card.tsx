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
        <section className={cn("rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm", className)}>
            {title && (
                <header className="px-5 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                    <h2 className="text-base font-semibold">{title}</h2>
                </header>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}
