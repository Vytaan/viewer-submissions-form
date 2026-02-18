import { useCallback, useState } from "react";
import { useLoadingContext } from "../../context/useLoadingContext";
import { useAuth, useResults, useRounds, useSubmissions, useWadValidation } from "../../hooks";
import type { Submission, WadValidationMapping } from "../../types";
import { SubmissionsTable } from "../../components/SubmissionsTable/SubmissionsTable";
import { StatsPanel } from "../../components/StatsPanel/StatsPanel";
import { ResultTabs } from "../../components/ResultTabs/ResultTabs";
import { Modal } from "../../components/Modal/Modal";
import { EndRoundWizard } from "../../components/EndRoundWizard/EndRoundWizard";
import { SubmissionForm } from "../../components/SubmissionForm/SubmissionForm";
import { useToast } from "../../components/Toast/useToast";
import { useConfirm } from "../../components/ConfirmDialog/useConfirm";
import { useAdminData } from "./useAdminData";
import { InfoModal } from "./InfoModal";
import { YouTubeModal } from "./YouTubeModal";
import { StatusModal } from "./StatusModal";
import { NewRoundModal } from "./NewRoundModal";
import { ChangeDetailsModal } from "./ChangeDetailsModal";
import { ValidationModal } from "./ValidationModal";
import { SetFileModal } from "./SetFileModal";
import { AdminToolbar } from "./AdminToolbar";
import styles from "./Admin.module.scss";

type ModalState =
    | { type: "none" }
    | { type: "endRound" }
    | { type: "modify"; submission: Submission }
    | { type: "youtube"; submissionId: number }
    | { type: "status"; submissionId: number; roundId: number }
    | { type: "newRound" }
    | { type: "changeDetails" }
    | { type: "validation"; mapping: WadValidationMapping }
    | { type: "setFile"; submissionId: number };

export function Admin() {
    const {
        isAuthenticated,
        activeRound,
        previousRounds,
        loading,
        reload,
        verifiedSubmissions,
        unverifiedSubmissions,
        stats,
    } = useAdminData();
    const { withLoading } = useLoadingContext();
    const { logout } = useAuth();
    const { pauseRound, deleteRound: deleteRoundApi } = useRounds();
    const { getSubmission, deleteEntries, verifyEntries } = useSubmissions();
    const { addRandomEntry } = useResults();
    const { getValidation } = useWadValidation();
    const { showToast } = useToast();
    const confirm = useConfirm();

    const [modal, setModal] = useState<ModalState>({ type: "none" });
    const [infoSubmission, setInfoSubmission] = useState<Submission | null>(null);
    const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<number[]>([]);
    const [selectedUnverifiedIds, setSelectedUnverifiedIds] = useState<number[]>([]);

    const closeModal = useCallback(() => {
        setModal({ type: "none" });
    }, []);

    const handlePause = useCallback(
        async (pause: boolean) => {
            await withLoading(async () => {
                try {
                    await pauseRound(pause);
                    reload();
                } catch (err) {
                    showToast(err instanceof Error ? err.message : "Failed", "error");
                }
            });
        },
        [withLoading, pauseRound, reload, showToast],
    );

    const handleDeleteRound = useCallback(
        async (roundId: number) => {
            const accepted = await confirm({
                message: "Are you sure you wish to delete this round? All associated data will be removed.",
            });
            if (!accepted) {
                return;
            }
            await withLoading(async () => {
                try {
                    await deleteRoundApi(roundId);
                    reload();
                } catch (err) {
                    showToast(err instanceof Error ? err.message : "Failed", "error");
                }
            });
        },
        [withLoading, deleteRoundApi, confirm, reload, showToast],
    );

    const handleShowInfo = useCallback(
        async (ids: number[]) => {
            if (ids.length !== 1) {
                return;
            }
            await withLoading(async () => {
                try {
                    const sub = await getSubmission(ids[0]);
                    setInfoSubmission(sub);
                } catch (err) {
                    showToast(err instanceof Error ? err.message : "Failed", "error");
                }
            });
        },
        [withLoading, getSubmission, showToast],
    );

    const handleModify = useCallback(
        async (ids: number[]) => {
            if (ids.length !== 1) {
                return;
            }
            await withLoading(async () => {
                try {
                    const sub = await getSubmission(ids[0]);
                    setModal({ type: "modify", submission: sub });
                } catch (err) {
                    showToast(err instanceof Error ? err.message : "Failed", "error");
                }
            });
        },
        [withLoading, getSubmission, showToast],
    );

    const handleDelete = useCallback(
        async (ids: number[]) => {
            const accepted = await confirm({ message: "Are you sure you wish to delete these entries?" });
            if (!accepted) {
                return;
            }
            await withLoading(async () => {
                try {
                    await deleteEntries(ids);
                    reload();
                } catch (err) {
                    showToast(err instanceof Error ? err.message : "Failed", "error");
                }
            });
        },
        [withLoading, deleteEntries, confirm, reload, showToast],
    );

    const handleVerify = useCallback(
        async (ids: number[]) => {
            const accepted = await confirm({ message: "Are you sure you wish to verify these entries?" });
            if (!accepted) {
                return;
            }
            await withLoading(async () => {
                try {
                    await verifyEntries(ids);
                    reload();
                } catch (err) {
                    showToast(err instanceof Error ? err.message : "Failed", "error");
                }
            });
        },
        [withLoading, verifyEntries, confirm, reload, showToast],
    );

    const handleLoadValidation = useCallback(async () => {
        await withLoading(async () => {
            try {
                const mapping = await getValidation();
                const decoded = { ...mapping };
                const decodedHeaders: (string | null)[] = [];
                for (let i = 0; i < mapping.allowedHeaders.length; i++) {
                    const h = mapping.allowedHeaders[i];
                    if (h) {
                        decodedHeaders.push(decodeURIComponent(h));
                    } else {
                        decodedHeaders.push(h);
                    }
                }
                decoded.allowedHeaders = decodedHeaders;
                const decodedHeadersZip: (string | null)[] = [];
                for (let i = 0; i < mapping.allowedHeadersZip.length; i++) {
                    const h = mapping.allowedHeadersZip[i];
                    if (h) {
                        decodedHeadersZip.push(decodeURIComponent(h));
                    } else {
                        decodedHeadersZip.push(h);
                    }
                }
                decoded.allowedHeadersZip = decodedHeadersZip;
                setModal({ type: "validation", mapping: decoded });
            } catch (err) {
                showToast(err instanceof Error ? err.message : "Failed", "error");
            }
        });
    }, [withLoading, getValidation, showToast]);

    const handleAddRandom = useCallback(
        async (roundId: number) => {
            const accepted = await confirm({ message: "Are you sure you wish to add a random entry?" });
            if (!accepted) {
                return;
            }
            await withLoading(async () => {
                try {
                    await addRandomEntry(roundId);
                    reload();
                } catch (err) {
                    showToast(err instanceof Error ? err.message : "Failed", "error");
                }
            });
        },
        [withLoading, addRandomEntry, confirm, reload, showToast],
    );

    const openSetFile = useCallback((id: number) => {
        setModal({ type: "setFile", submissionId: id });
    }, []);

    const openYouTube = useCallback((id: number) => {
        setModal({ type: "youtube", submissionId: id });
    }, []);

    const openStatus = useCallback((id: number, roundId: number) => {
        setModal({ type: "status", submissionId: id, roundId });
    }, []);

    const renderPreviousRoundToolbar = useCallback(
        (selectedIds: number[], roundId: number) => (
            <AdminToolbar
                selectedIds={selectedIds}
                roundId={roundId}
                onShowInfo={handleShowInfo}
                onModify={handleModify}
                onSetFile={openSetFile}
                onChangeStatus={openStatus}
                onSetYouTube={openYouTube}
                onDelete={handleDelete}
                onAddRandom={handleAddRandom}
            />
        ),
        [handleShowInfo, handleModify, openSetFile, openStatus, openYouTube, handleDelete, handleAddRandom],
    );

    if (isAuthenticated !== true || loading) {
        return null;
    }

    return (
        <>
            {activeRound ? (
                <>
                    <div className={styles.activeRoundCard}>
                        <div className={styles.activeRoundHeader}>{activeRound.name}</div>
                        <div className={styles.activeRoundBody}>
                            <div className={activeRound.paused ? styles.statusPaused : styles.statusActive}>
                                {activeRound.paused ? "Round is currently paused" : "Round is active"}
                            </div>
                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Submissions</div>
                                    <div className={styles.statValue}>{verifiedSubmissions.length}</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Most Requested WAD</div>
                                    <div className={styles.statValue}>{stats?.mostWad ?? "N/A"}</div>
                                    {stats && (
                                        <div className={styles.statSubtext}>{stats.mostPct}% of all submissions</div>
                                    )}
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Map Authors</div>
                                    <div className={styles.statValue}>{stats?.authorCount ?? 0}</div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.roundActions}>
                            {activeRound.paused ? (
                                <button className={styles.btn} onClick={() => handlePause(false)}>
                                    Resume Round
                                </button>
                            ) : (
                                <button className={styles.btn} onClick={() => handlePause(true)}>
                                    Pause Round
                                </button>
                            )}
                            <button className={styles.btnSuccess} onClick={() => setModal({ type: "endRound" })}>
                                End Round
                            </button>
                            <button className={styles.btnDanger} onClick={() => handleDeleteRound(activeRound.id)}>
                                Delete Round
                            </button>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <StatsPanel roundId={activeRound.id} />
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>Submissions Requiring Verification</div>
                            <div className={styles.sectionBody}>
                                {unverifiedSubmissions.length > 0 ? (
                                    <SubmissionsTable
                                        submissions={unverifiedSubmissions}
                                        isAdmin={true}
                                        isPreviousResults={true}
                                        selectable={true}
                                        onSelectionChange={setSelectedUnverifiedIds}
                                        toolbar={
                                            <AdminToolbar
                                                selectedIds={selectedUnverifiedIds}
                                                onVerify={handleVerify}
                                                onShowInfo={handleShowInfo}
                                                onDelete={handleDelete}
                                            />
                                        }
                                    />
                                ) : (
                                    <p>No submissions pending verification.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHeader}>Current Submissions</div>
                            <div className={styles.sectionBody}>
                                <SubmissionsTable
                                    submissions={verifiedSubmissions}
                                    isAdmin={true}
                                    isPreviousResults={true}
                                    selectable={true}
                                    onSelectionChange={setSelectedSubmissionIds}
                                    toolbar={
                                        <AdminToolbar
                                            selectedIds={selectedSubmissionIds}
                                            roundId={activeRound.id}
                                            onShowInfo={handleShowInfo}
                                            onModify={handleModify}
                                            onSetFile={openSetFile}
                                            onSetYouTube={openYouTube}
                                            onChangeStatus={openStatus}
                                            onDelete={handleDelete}
                                        />
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className={styles.noRound}>
                    <h2>Create a New Submission Round</h2>
                    <p>Clicking this button will create a new submission round and enable people to submit entries.</p>
                    <button className={styles.createRoundBtn} onClick={() => setModal({ type: "newRound" })}>
                        Make New Round
                    </button>
                </div>
            )}

            {previousRounds.length > 0 && (
                <div className={styles.section}>
                    <ResultTabs
                        rounds={previousRounds}
                        isAdmin={true}
                        onDeleteRound={handleDeleteRound}
                        renderToolbar={renderPreviousRoundToolbar}
                    />
                </div>
            )}

            <div className={styles.bottomActions}>
                <button className={styles.btn} onClick={logout}>
                    Logout
                </button>
                <button className={styles.btn} onClick={() => setModal({ type: "changeDetails" })}>
                    Change Details
                </button>
                <button className={styles.btn} onClick={handleLoadValidation}>
                    Validation Settings
                </button>
            </div>

            <Modal open={modal.type === "endRound"} onClose={closeModal} title="End Current Round" size="lg">
                <EndRoundWizard
                    isPaused={activeRound?.paused ?? false}
                    onPause={() => handlePause(true)}
                    onFinish={() => {
                        closeModal();
                        reload();
                    }}
                />
            </Modal>

            <Modal
                open={modal.type === "modify"}
                onClose={closeModal}
                title="Modify Submission"
                footer={
                    <button
                        className={styles.btn}
                        onClick={() => {
                            closeModal();
                            reload();
                        }}
                    >
                        Close
                    </button>
                }
            >
                {modal.type === "modify" && (
                    <SubmissionForm
                        isAdmin={true}
                        submissionId={modal.submission.id}
                        initialValues={{
                            wadURL: modal.submission.wadURL,
                            wadName: modal.submission.wadName,
                            wadLevel: modal.submission.wadLevel,
                            wadEngine: modal.submission.wadEngine,
                            playTestEngine: modal.submission.playTestEngine,
                            submitterName: modal.submission.submitterName,
                            submitterAuthor: modal.submission.submitterAuthor,
                            distributable: modal.submission.distributable,
                            recordedFormat: modal.submission.recordedFormat,
                        }}
                        onSuccess={() => {
                            closeModal();
                            reload();
                        }}
                    />
                )}
            </Modal>

            <InfoModal submission={infoSubmission} onClose={() => setInfoSubmission(null)} />

            <YouTubeModal
                open={modal.type === "youtube"}
                onClose={closeModal}
                submissionId={modal.type === "youtube" ? modal.submissionId : 0}
                onSuccess={reload}
            />

            <StatusModal
                open={modal.type === "status"}
                onClose={closeModal}
                submissionId={modal.type === "status" ? modal.submissionId : 0}
                roundId={modal.type === "status" ? modal.roundId : 0}
                onSuccess={reload}
            />

            <NewRoundModal open={modal.type === "newRound"} onClose={closeModal} onSuccess={reload} />

            <ChangeDetailsModal open={modal.type === "changeDetails"} onClose={closeModal} />

            <ValidationModal
                open={modal.type === "validation"}
                onClose={closeModal}
                initialMapping={modal.type === "validation" ? modal.mapping : null}
            />

            <SetFileModal
                open={modal.type === "setFile"}
                onClose={closeModal}
                submissionId={modal.type === "setFile" ? modal.submissionId : 0}
                onSuccess={reload}
            />
        </>
    );
}
