import { useCallback, useState } from "react";
import { useRounds } from "../../hooks";
import { useLoadingContext } from "../../context/useLoadingContext";
import { useToast } from "../../components/Toast/useToast";
import { Modal } from "../../components/Modal/Modal";
import styles from "./Admin.module.scss";

interface NewRoundModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NewRoundModal({ open, onClose, onSuccess }: NewRoundModalProps) {
    const { newRound } = useRounds();
    const { withLoading } = useLoadingContext();
    const { showToast } = useToast();
    const [roundName, setRoundName] = useState("");
    const [roundDeadline, setRoundDeadline] = useState("");
    const [prevOpen, setPrevOpen] = useState(false);

    if (open && !prevOpen) {
        setPrevOpen(true);
        setRoundName("");
        setRoundDeadline("");
    }
    if (!open && prevOpen) {
        setPrevOpen(false);
    }

    const handleSubmit = useCallback(async () => {
        if (!roundName) {
            showToast("Please supply a name", "warning");
            return;
        }
        await withLoading(async () => {
            try {
                const endDate = roundDeadline ? new Date(roundDeadline).getTime() : undefined;
                await newRound(roundName, endDate);
                onClose();
                onSuccess();
            } catch (err) {
                showToast(err instanceof Error ? err.message : "Failed", "error");
            }
        });
    }, [withLoading, newRound, roundName, roundDeadline, onClose, onSuccess, showToast]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Create a New Round"
            footer={
                <button className={styles.btn} onClick={handleSubmit}>
                    Create
                </button>
            }
        >
            <div className={styles.formField}>
                <label className={styles.formLabel}>Round Name</label>
                <input
                    type="text"
                    className={styles.formInput}
                    value={roundName}
                    onChange={e => setRoundName(e.target.value)}
                    required
                />
            </div>
            <div className={styles.formField}>
                <label className={styles.formLabel}>Round Deadline</label>
                <input
                    type="date"
                    className={styles.formInput}
                    value={roundDeadline}
                    onChange={e => setRoundDeadline(e.target.value)}
                />
            </div>
        </Modal>
    );
}
