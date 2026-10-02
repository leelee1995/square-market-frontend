"use client";

import { Toast } from "./toast";
import { useToast } from "@/hooks/useToast";

export function ToastContainer() {
    const { toasts, remove } = useToast();

    return (
        <div className="toast toast-top toast-center z-50">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={() => remove(toast.id)}
                />
            ))}
        </div>
    );
}
