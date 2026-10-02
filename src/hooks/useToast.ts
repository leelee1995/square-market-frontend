"use client";

import { Toast, toastStore } from "@/stores/toast-store";
import { useSyncExternalStore } from "react";

const EMPTY_TOASTS: Toast[] = [];

export function useToast() {
    //  useSyncExternalStore - lets React subscribe to your external store correctly
    const toasts = useSyncExternalStore(
        toastStore.subscribe,
        toastStore.getToasts,
        () => EMPTY_TOASTS,
    );

    return {
        toasts,
        success: toastStore.success,
        error: toastStore.error,
        info: toastStore.info,
        warning: toastStore.warning,
        remove: toastStore.remove,
    };
}
