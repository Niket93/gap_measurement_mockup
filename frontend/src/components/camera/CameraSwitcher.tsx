"use client";

import { Button } from "@/components/ui/Button";

export function CameraSwitcher({
    onSwitch,
    disabled
}: {
    onSwitch: () => void;
    disabled?: boolean;
}) {
    return (
        <Button
            type="button"
            variant="secondary"
            onClick={onSwitch}
            disabled={disabled}
            aria-label="Switch camera"
        >
            Switch Camera
        </Button>
    );
}
