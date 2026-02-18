import { type ReactNode, useCallback, useState } from "react";
import { Modal } from "../Modal/Modal";
import { ConfirmContext } from "./useConfirm";
import styles from "./ConfirmDialog.module.scss";

interface ConfirmOptions {
    title?: string;
    message: string;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        return new Promise<boolean>(resolve => {
            setResolver(() => resolve);
        });
    }, []);

    function handleConfirm() {
        if (resolver) {
            resolver(true);
        }
        setOptions(null);
        setResolver(null);
    }

    function handleCancel() {
        if (resolver) {
            resolver(false);
        }
        setOptions(null);
        setResolver(null);
    }

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {options && (
                <Modal
                    open={true}
                    onClose={handleCancel}
                    title={options.title ?? "Confirm"}
                    footer={
                        <div className={styles.actions}>
                            <button className={styles.cancelBtn} onClick={handleCancel}>
                                Cancel
                            </button>
                            <button className={styles.confirmBtn} onClick={handleConfirm}>
                                Confirm
                            </button>
                        </div>
                    }
                >
                    <p className={styles.message}>{options.message}</p>
                </Modal>
            )}
        </ConfirmContext.Provider>
    );
}
