import { useCallback, useState } from "react";
import { useAuth } from "../../hooks";
import { useLoadingContext } from "../../context/useLoadingContext";
import { useToast } from "../../components/Toast/useToast";
import { Modal } from "../../components/Modal/Modal";
import styles from "./Admin.module.scss";

interface ChangeDetailsModalProps {
    open: boolean;
    onClose: () => void;
}

export function ChangeDetailsModal({ open, onClose }: ChangeDetailsModalProps) {
    const { changeDetails } = useAuth();
    const { withLoading } = useLoadingContext();
    const { showToast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");
    const [prevOpen, setPrevOpen] = useState(false);

    if (open && !prevOpen) {
        setPrevOpen(true);
        setEmail("");
        setPassword("");
        setPasswordRepeat("");
    }
    if (!open && prevOpen) {
        setPrevOpen(false);
    }

    const handleSubmit = useCallback(async () => {
        if (!email) {
            showToast("Please specify email", "warning");
            return;
        }
        if (!password) {
            showToast("Password must not be blank", "warning");
            return;
        }
        if (password !== passwordRepeat) {
            showToast("Passwords do not match", "warning");
            return;
        }
        await withLoading(async () => {
            try {
                await changeDetails(email, password);
                showToast("User details changed successfully", "success");
                onClose();
            } catch (err) {
                showToast(err instanceof Error ? err.message : "Failed", "error");
            }
        });
    }, [withLoading, email, password, passwordRepeat, changeDetails, onClose, showToast]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Change Account Details"
            footer={
                <button className={styles.btn} onClick={handleSubmit}>
                    Ok
                </button>
            }
        >
            <div className={styles.formField}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                    type="email"
                    className={styles.formInput}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div className={styles.formField}>
                <label className={styles.formLabel}>New Password</label>
                <input
                    type="password"
                    className={styles.formInput}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>
            <div className={styles.formField}>
                <label className={styles.formLabel}>Repeat Password</label>
                <input
                    type="password"
                    className={styles.formInput}
                    value={passwordRepeat}
                    onChange={e => setPasswordRepeat(e.target.value)}
                />
            </div>
        </Modal>
    );
}
