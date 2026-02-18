import { useCallback, useState } from "react";
import { useResults, useSubmissions } from "../../hooks";
import { useLoadingContext } from "../../context/useLoadingContext";
import { useToast } from "../../components/Toast/useToast";
import { SubmissionStatusType } from "../../types/enums";
import { Modal } from "../../components/Modal/Modal";
import styles from "./Admin.module.scss";

interface StatusModalProps {
    open: boolean;
    onClose: () => void;
    submissionId: number;
    roundId: number;
    onSuccess: () => void;
}

export function StatusModal({ open, onClose, submissionId, roundId, onSuccess }: StatusModalProps) {
    const { changeStatus } = useSubmissions();
    const { addRandomEntry } = useResults();
    const { withLoading } = useLoadingContext();
    const { showToast } = useToast();

    const [statusValue, setStatusValue] = useState("Queued");
    const [statusComments, setStatusComments] = useState("");
    const [generateRandom, setGenerateRandom] = useState(false);
    const [prevOpen, setPrevOpen] = useState(false);

    if (open && !prevOpen) {
        setPrevOpen(true);
        setStatusValue("Queued");
        setStatusComments("");
        setGenerateRandom(false);
    }
    if (!open && prevOpen) {
        setPrevOpen(false);
    }

    const handleSubmit = useCallback(async () => {
        await withLoading(async () => {
            try {
                await changeStatus(submissionId, statusValue, statusComments || undefined);
                if (generateRandom && statusValue === SubmissionStatusType.REJECTED) {
                    await addRandomEntry(roundId);
                }
                onClose();
                onSuccess();
            } catch (err) {
                showToast(err instanceof Error ? err.message : "Failed", "error");
            }
        });
    }, [
        withLoading,
        changeStatus,
        submissionId,
        statusValue,
        statusComments,
        generateRandom,
        roundId,
        addRandomEntry,
        onClose,
        onSuccess,
        showToast,
    ]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Modify Submission Status"
            footer={
                <button className={styles.btn} onClick={handleSubmit}>
                    Ok
                </button>
            }
        >
            <div className={styles.formField}>
                <label className={styles.formLabel}>Status</label>
                <select
                    className={styles.formSelect}
                    value={statusValue}
                    onChange={e => setStatusValue(e.target.value)}
                >
                    <option value="Queued">Queued</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>
            <div className={styles.formField}>
                <label className={styles.formLabel}>Comments</label>
                <textarea
                    className={styles.formInput}
                    value={statusComments}
                    onChange={e => setStatusComments(e.target.value)}
                    rows={3}
                />
            </div>
            {statusValue === "Rejected" && (
                <div className={styles.formField}>
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.85rem",
                            color: "#d4d4d4",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={generateRandom}
                            onChange={e => setGenerateRandom(e.target.checked)}
                        />
                        Generate another random entry for this round
                    </label>
                </div>
            )}
        </Modal>
    );
}
