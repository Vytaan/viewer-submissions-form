import { useCallback, useRef } from "react";
import { useSubmissions } from "../../hooks";
import { useLoadingContext } from "../../context/useLoadingContext";
import { useToast } from "../../components/Toast/useToast";
import { Modal } from "../../components/Modal/Modal";
import styles from "./Admin.module.scss";

interface SetFileModalProps {
    open: boolean;
    onClose: () => void;
    submissionId: number;
    onSuccess: () => void;
}

export function SetFileModal({ open, onClose, submissionId, onSuccess }: SetFileModalProps) {
    const { setFile } = useSubmissions();
    const { withLoading } = useLoadingContext();
    const { showToast } = useToast();
    const fileRef = useRef<HTMLInputElement>(null);

    const handleSubmit = useCallback(async () => {
        const file = fileRef.current?.files?.[0];
        if (!file) {
            showToast("No file selected", "warning");
            return;
        }
        await withLoading(async () => {
            try {
                await setFile(submissionId, file);
                showToast("File has been set", "success");
                onClose();
                onSuccess();
            } catch (err) {
                showToast(err instanceof Error ? err.message : "Failed", "error");
            }
        });
    }, [withLoading, setFile, submissionId, onClose, onSuccess, showToast]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Set File for Submission"
            footer={
                <button className={styles.btn} onClick={handleSubmit}>
                    Ok
                </button>
            }
        >
            <div className={styles.formField}>
                <label className={styles.formLabel}>Upload WAD</label>
                <input type="file" className={styles.formInput} ref={fileRef} />
            </div>
        </Modal>
    );
}
