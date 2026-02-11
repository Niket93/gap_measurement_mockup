"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Point } from "@/lib/api/types";
import { clamp } from "@/lib/geometry/transforms";

type Props = {
    image: HTMLImageElement;
    points: Point[];
    onAddPoint: (p: Point) => void;
    onUndo: () => void;
    onReset: () => void;
    mode: "2" | "4";
};

type Pointer = { id: number; x: number; y: number };

export function ZoomPanCanvas({ image, points, onAddPoint, onUndo, onReset, mode }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [ready, setReady] = useState(false);

    // Transform: screen -> image via pan/zoom
    const [scale, setScale] = useState(1);
    const [tx, setTx] = useState(0); // translate in screen px
    const [ty, setTy] = useState(0);

    const pointers = useRef<Map<number, Pointer>>(new Map());
    const lastPinch = useRef<{ dist: number; midX: number; midY: number } | null>(null);

    const needed = mode === "2" ? 2 : 4;

    const dpr = useMemo(() => (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        function resize() {
            const rect = parent.getBoundingClientRect();
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${Math.min(rect.height, 520)}px`;
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(Math.min(rect.height, 520) * dpr);

            // Fit image initially
            const fitScale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
            setScale(fitScale);
            setTx((canvas.width - image.naturalWidth * fitScale) / 2);
            setTy((canvas.height - image.naturalHeight * fitScale) / 2);

            setReady(true);
        }

        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(parent);

        return () => ro.disconnect();
    }, [dpr, image]);

    function screenToImage(x: number, y: number): Point {
        // x,y are in CSS pixels; convert to device pixels for math to align with canvas coords
        const px = x * dpr;
        const py = y * dpr;
        const ix = (px - tx) / scale;
        const iy = (py - ty) / scale;
        return { x: clamp(ix, 0, image.naturalWidth - 1), y: clamp(iy, 0, image.naturalHeight - 1) };
    }

    function draw() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw image
        ctx.save();
        ctx.translate(tx, ty);
        ctx.scale(scale, scale);
        ctx.drawImage(image, 0, 0);
        ctx.restore();

        // overlay points + lines
        ctx.save();
        ctx.lineWidth = 2 * dpr;
        ctx.fillStyle = "rgba(0, 255, 0, 0.9)";
        ctx.strokeStyle = "rgba(255, 0, 0, 0.9)";

        const toScreen = (p: Point) => ({
            sx: p.x * scale + tx,
            sy: p.y * scale + ty
        });

        // preview lines/polygon
        if (points.length >= 2) {
            const a = toScreen(points[0]);
            const b = toScreen(points[1]);
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
        }
        if (mode === "4" && points.length >= 3) {
            const s = points.map(toScreen);
            ctx.beginPath();
            ctx.moveTo(s[0].sx, s[0].sy);
            for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].sx, s[i].sy);
            ctx.stroke();
            if (points.length === 4) {
                ctx.beginPath();
                ctx.moveTo(s[0].sx, s[0].sy);
                ctx.lineTo(s[1].sx, s[1].sy);
                ctx.lineTo(s[2].sx, s[2].sy);
                ctx.lineTo(s[3].sx, s[3].sy);
                ctx.closePath();
                ctx.stroke();
            }
        }

        // points
        for (let i = 0; i < points.length; i++) {
            const p = toScreen(points[i]);
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, 6 * dpr, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(0,0,0,0.65)";
            ctx.font = `${12 * dpr}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
            ctx.fillText(`${i + 1}`, p.sx + 8 * dpr, p.sy - 8 * dpr);
            ctx.fillStyle = "rgba(0, 255, 0, 0.9)";
        }

        ctx.restore();
    }

    useEffect(() => {
        if (!ready) return;
        const raf = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, points, scale, tx, ty]);

    function onPointerDown(e: React.PointerEvent) {
        (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
        pointers.current.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY });

        if (pointers.current.size === 2) {
            const arr = Array.from(pointers.current.values());
            const dx = arr[0].x - arr[1].x;
            const dy = arr[0].y - arr[1].y;
            const dist = Math.hypot(dx, dy);
            const midX = (arr[0].x + arr[1].x) / 2;
            const midY = (arr[0].y + arr[1].y) / 2;
            lastPinch.current = { dist, midX, midY };
        }
    }

    function onPointerMove(e: React.PointerEvent) {
        const p = pointers.current.get(e.pointerId);
        if (!p) return;

        pointers.current.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY });

        // pinch zoom
        if (pointers.current.size === 2) {
            const arr = Array.from(pointers.current.values());
            const dx = arr[0].x - arr[1].x;
            const dy = arr[0].y - arr[1].y;
            const dist = Math.hypot(dx, dy);
            const midX = (arr[0].x + arr[1].x) / 2;
            const midY = (arr[0].y + arr[1].y) / 2;

            const last = lastPinch.current;
            if (last) {
                const zoom = dist / (last.dist || dist);
                const nextScale = clamp(scale * zoom, 0.2 * dpr, 8 * dpr);

                // Zoom around midpoint
                const mx = midX * dpr;
                const my = midY * dpr;
                const imgX = (mx - tx) / scale;
                const imgY = (my - ty) / scale;

                const nextTx = mx - imgX * nextScale;
                const nextTy = my - imgY * nextScale;

                setScale(nextScale);
                setTx(nextTx);
                setTy(nextTy);

                lastPinch.current = { dist, midX, midY };
            }
            return;
        }

        // pan with 1 pointer
        const dx = (e.clientX - p.x) * dpr;
        const dy = (e.clientY - p.y) * dpr;
        setTx((v) => v + dx);
        setTy((v) => v + dy);
    }

    function onPointerUp(e: React.PointerEvent) {
        pointers.current.delete(e.pointerId);
        if (pointers.current.size < 2) lastPinch.current = null;
    }

    function onClick(e: React.MouseEvent) {
        // If user is panning/pinching, we don’t want accidental clicks.
        // Simple heuristic: only allow click when single pointer and not currently dragging.
        if (pointers.current.size > 0) return;

        if (points.length >= needed) return;

        const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const p = screenToImage(x, y);
        onAddPoint(p);
    }

    return (
        <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 touch-none">
                <canvas
                    ref={canvasRef}
                    className="w-full h-[520px] block touch-none"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onClick={onClick}
                    aria-label="Image point picker canvas"
                    role="img"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    className="text-sm underline text-zinc-700 dark:text-zinc-200"
                    onClick={onUndo}
                    disabled={points.length === 0}
                >
                    Undo
                </button>
                <button
                    type="button"
                    className="text-sm underline text-zinc-700 dark:text-zinc-200"
                    onClick={onReset}
                    disabled={points.length === 0}
                >
                    Reset
                </button>
            </div>

            <div className="text-xs text-zinc-500">
                Pinch to zoom, drag to pan. Tap to place points.
            </div>
        </div>
    );
}
