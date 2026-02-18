import type { Submission } from "../../types";
import { Modal } from "../../components/Modal/Modal";
import styles from "./Admin.module.scss";

interface InfoModalProps {
    submission: Submission | null;
    onClose: () => void;
}

export function InfoModal({ submission, onClose }: InfoModalProps) {
    return (
        <Modal
            open={submission !== null}
            onClose={onClose}
            title={`Info for ${submission?.wadName ?? ""}`}
            footer={
                <button className={styles.btn} onClick={onClose}>
                    Ok
                </button>
            }
        >
            {submission && (
                <div className={styles.infoContent}>
                    <p>ID: {submission.id}</p>
                    <p>WAD Name: {submission.wadName}</p>
                    <p>WAD Level: {submission.wadLevel}</p>
                    <p>WAD Engine: {submission.wadEngine}</p>
                    {submission.gzDoomActions && submission.gzDoomActions.length > 0 && (
                        <p>GZDoom Actions: {submission.gzDoomActions.join(", ")}</p>
                    )}
                    {submission.submitterName && <p>Submitter Name: {submission.submitterName}</p>}
                    <p>Submitter Created This Map: {String(submission.submitterAuthor)}</p>
                    <p>Distributable: {String(submission.distributable)}</p>
                    {submission.info && (
                        <div>
                            Info: <pre>{submission.info}</pre>
                        </div>
                    )}
                    <p>
                        Email: <span className={styles.spoiler}>{submission.submitterEmail}</span>
                    </p>
                    <p>Record Format: {submission.recordedFormat}</p>
                    <p>Play Tested On: {submission.playTestEngine ?? "N/A"}</p>
                </div>
            )}
        </Modal>
    );
}
