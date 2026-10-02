export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
    id: string;
    message: string;
    type: ToastType;
};

let toasts: Toast[] = [];

const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((listener) => listener());
}

export const toastStore = {
    getToasts() {
        return toasts;
    },

    subscribe(listener: () => void) {
        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };
    },

    add(message: string, type: ToastType) {
        const toast: Toast = {
            id: crypto.randomUUID(),
            message,
            type,
        };

        toasts = [...toasts, toast];

        emit();

        return toast.id;
    },

    remove(id: string) {
        toasts = toasts.filter((toast) => toast.id !== id);

        emit();
    },

    success(message: string) {
        return toastStore.add(message, "success");
    },

    error(message: string) {
        return toastStore.add(message, "error");
    },

    info(message: string) {
        return toastStore.add(message, "info");
    },

    warning(message: string) {
        return toastStore.add(message, "warning");
    },
};
