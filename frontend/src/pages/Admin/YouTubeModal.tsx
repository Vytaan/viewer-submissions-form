import { useCallback, useState } from "react";
import { useSubmissions } from "../../hooks";
import { useLoadingContext } from "../../context/useLoadingContext";
import { useToast } from "../../components/Toast/useToast";
import { Modal } from "../../components/Modal/Modal";
import styles from "./Admin.module.scss";

interface YouTubeModalProps {
    open: boolean;
    onClose: () => void;
    submissionId: number;
    onSuccess: () => void;
}

export function YouTubeModal({ open, onClose, submissionId, onSuccess }: YouTubeModalProps) {
    const { setYoutubeLink } = useSubmissions();
    const { withLoading } = useLoadingContext();
    const { showToast } = useToast();
    const [link, setLink] = useState("");
    const [prevOpen, setPrevOpen] = useState(false);

    if (open && !prevOpen) {
        setPrevOpen(true);
        setLink("");
    }
    if (!open && prevOpen) {
        setPrevOpen(false);
    }

    const handleSubmit = useCallback(async () => {
        await withLoading(async () => {
            try {
                await setYoutubeLink(submissionId, link || undefined);
                onClose();
                showToast(`YouTube link ${link ? "set" : "cleared"}`, "success");
                onSuccess();
            } catch (err) {
                showToast(err instanceof Error ? err.message : "Failed", "error");
            }
        });
    }, [withLoading, setYoutubeLink, submissionId, link, onClose, onSuccess, showToast]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Set YouTube Link"
            footer={
                <button className={styles.btn} onClick={handleSubmit}>
                    Ok
                </button>
            }
        >
            <div className={styles.formField}>
                <label className={styles.formLabel}>Enter YouTube Extension</label>
                <div className={styles.inputGroup}>
                    <span className={styles.inputGroupText}>https://www.youtube.com/</span>
                    <input
                        type="text"
                        className={styles.formInput}
                        value={link}
                        onChange={e => setLink(e.target.value)}
                        placeholder="watch?v=t7BW5ZiTmrE"
                    />
                </div>
            </div>
        </Modal>
    );
}
