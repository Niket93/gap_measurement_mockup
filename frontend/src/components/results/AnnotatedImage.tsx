export function AnnotatedImage({ base64Png }: { base64Png: string }) {
    const src = `data:image/png;base64,${base64Png}`;
    return (
        <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Annotated result image" className="w-full h-auto object-contain" />
        </div>
    );
}
