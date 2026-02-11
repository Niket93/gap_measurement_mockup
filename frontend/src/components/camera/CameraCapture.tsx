"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CameraSwitcher } from "@/components/camera/CameraSwitcher";
import { FileFallbackInput } from "@/components/camera/FileFallbackInput";

type CameraState =
    | { kind: "idle" }
    | { kind: "ready" }
    | { kind: "denied" }
    | { kind: "no-camera" }
    | { kind: "error"; message: string };

export function CameraCapture({ onCaptured }: { onCaptured: (dataUrl: string) => void }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [state, setState] = useState<CameraState>({ kind: "idle" });
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Track whether we're requesting environment or user camera
    const [useEnvironment, setUseEnvironment] = useState(true);

    const constraints = useMemo<MediaStreamConstraints>(
        () => ({
            video: {
                facingMode: useEnvironment ? { ideal: "environment" } : { ideal: "user" },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        }),
        [useEnvironment]
    );

    useEffect(() => {
        let cancelled = false;

        async function start() {
            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    setState({ kind: "no-camera" });
                    return;
                }
                const devices = await navigator.mediaDevices.enumerateDevices();
                const hasVideo = devices.some((d) => d.kind === "videoinput");
                if (!hasVideo) {
                    setState({ kind: "no-camera" });
                    return;
                }

                const s = await navigator.mediaDevices.getUserMedia(constraints);
                if (cancelled) return;

                setStream(s);
                const video = videoRef.current;
                if (video) {
                    video.srcObject = s;
                    await video.play();
                }
                setState({ kind: "ready" });
            } catch (e: any) {
                const name = e?.name ?? "";
                if (name === "NotAllowedError" || name === "PermissionDeniedError") {
                    setState({ kind: "denied" });
                } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
                    setState({ kind: "no-camera" });
                } else {
                    setState({ kind: "error", message: String(e?.message ?? e) });
                }
            }
        }

        start();

        return () => {
            cancelled = true;
            if (stream) {
                for (const t of stream.getTracks()) t.stop();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [constraints]);

    function cleanupStream() {
        if (stream) {
            for (const t of stream.getTracks()) t.stop();
            setStream(null);
        }
    }

    function capture() {
        const video = videoRef.current;
        if (!video) return;

        // High-res capture via canvas
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return;

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

        // Stop camera after capture (good for mobile battery + privacy)
        cleanupStream();

        onCaptured(dataUrl);
    }

    return (
        <div className="space-y-4">
            {(state.kind === "ready" || state.kind === "idle") && (
                <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black">
                        <video
                            ref={videoRef}
                            playsInline
                            muted
                            className="w-full h-auto max-h-[60vh] object-contain"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        <Button type="button" onClick={capture} disabled={state.kind !== "ready"}>
                            Capture Image
                        </Button>

                        <CameraSwitcher
                            disabled={state.kind !== "ready"}
                            onSwitch={() => {
                                cleanupStream();
                                setUseEnvironment((v) => !v);
                                setState({ kind: "idle" });
                            }}
                        />

                        <div className="text-xs text-zinc-500">
                            Uses rear camera when possible for maximum quality.
                        </div>
                    </div>
                </div>
            )}

            {state.kind === "denied" && (
                <div className="space-y-2">
                    <div className="text-sm">
                        Camera permission denied. You can upload an image instead.
                    </div>
                    <FileFallbackInput onPicked={onCaptured} />
                </div>
            )}

            {state.kind === "no-camera" && (
                <div className="space-y-2">
                    <div className="text-sm">No camera found. Upload an image instead.</div>
                    <FileFallbackInput onPicked={onCaptured} />
                </div>
            )}

            {state.kind === "error" && (
                <div className="space-y-2">
                    <div className="text-sm">Camera error: {state.message}</div>
                    <FileFallbackInput onPicked={onCaptured} />
                </div>
            )}
        </div>
    );
}
