import { type ReactNode, useCallback, useState } from "react";
import { ToastContext } from "./useToast";
import styles from "./Toast.module.scss";

type ToastType = "error" | "success" | "warning" | "info";

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "error") => {
        const id = nextId++;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const iconMap: Record<ToastType, string> = {
        error: "bi-exclamation-triangle-fill",
        success: "bi-check-circle-fill",
        warning: "bi-exclamation-circle-fill",
        info: "bi-info-circle-fill",
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.container}>
                {toasts.map(toast => (
                    <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
                        <i className={`bi ${iconMap[toast.type]}`} />
                        <span className={styles.message}>{toast.message}</span>
                        <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>
                            <i className="bi bi-x" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
