import { useEffect } from "react";

type ToastProps = {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    onClose: () => void;
};

export function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`alert alert-${type} shadow-lg font-bold`}>
            <span>{message}</span>

            <button onClick={onClose} className="btn btn-ghost btn-xs">
                ✕
            </button>
        </div>
    );
}
