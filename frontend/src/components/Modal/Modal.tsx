import { type ReactNode, useEffect } from "react";
import styles from "./Modal.module.scss";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: "default" | "lg" | "xl";
}

export function Modal({ open, onClose, title, children, footer, size = "default" }: ModalProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    const modalClasses = [styles.modal];
    if (size === "lg") {
        modalClasses.push(styles.modalLg);
    }
    if (size === "xl") {
        modalClasses.push(styles.modalXl);
    }

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={modalClasses.join(" ")} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>
                <div className={styles.body}>{children}</div>
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>
    );
}
