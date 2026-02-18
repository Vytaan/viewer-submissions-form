import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import * as homeApi from "../../utils/api/homeApi";
import styles from "./SubmissionSuccess.module.scss";

export function SubmissionSuccess() {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState("Processing...");
    const [success, setSuccess] = useState<boolean | null>(null);
    const uid = searchParams.get("uid");

    useEffect(() => {
        async function process() {
            if (!uid) {
                setMessage("No confirmation UID supplied.");
                setSuccess(false);
                return;
            }

            try {
                const data = await homeApi.processConfirmation(uid);
                setMessage(data.message);
                setSuccess(data.success);
            } catch {
                setMessage("Your submission has been submitted and is awaiting manual verification.");
                setSuccess(true);
            }
        }
        process();
    }, [uid]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {success === null ? (
                    <div className={styles.iconSuccess}>
                        <i className="bi bi-hourglass-split" />
                    </div>
                ) : success ? (
                    <div className={styles.iconSuccess}>
                        <i className="bi bi-check-circle-fill" />
                    </div>
                ) : (
                    <div className={styles.iconError}>
                        <i className="bi bi-x-circle-fill" />
                    </div>
                )}
                <p className={styles.message}>{message}</p>
                <Link to="/" className={styles.homeLink}>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
