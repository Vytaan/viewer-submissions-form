import { useCallback, useEffect, useRef, useState } from "react";
import * as homeApi from "../../utils/api/homeApi";
import type { Submission, SubmissionRound } from "../../types";
import { SubmissionForm } from "../../components/SubmissionForm/SubmissionForm";
import { SubmissionsTable } from "../../components/SubmissionsTable/SubmissionsTable";
import { StatsPanel } from "../../components/StatsPanel/StatsPanel";
import { ResultTabs } from "../../components/ResultTabs/ResultTabs";
import { useSocketContext } from "../../context/useSocketContext";
import { useSocket } from "../../hooks";
import styles from "./Home.module.scss";

export function Home() {
    const [activeRound, setActiveRound] = useState<SubmissionRound | null>(null);
    const [previousRounds, setPreviousRounds] = useState<SubmissionRound[]>([]);
    const [loading, setLoading] = useState(true);
    const [resultsMaxHeight, setResultsMaxHeight] = useState<number | null>(null);
    const { connected } = useSocketContext();
    const formCardRef = useRef<HTMLDivElement>(null);

    const loadData = useCallback(async () => {
        try {
            const data = await homeApi.getHomeData();
            setActiveRound(data.model.currentActiveRound);
            setPreviousRounds(data.model.previousRounds);
        } catch {
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!formCardRef.current) {
            return;
        }
        const observer = new ResizeObserver(entries => {
            for (let i = 0; i < entries.length; i++) {
                setResultsMaxHeight(entries[i].contentRect.height);
            }
        });
        observer.observe(formCardRef.current);
        return () => observer.disconnect();
    }, [activeRound]);

    const handleNewSubmission = useCallback((data: { id: number; wadName: string; wadLevel: string }) => {
        setActiveRound(prev => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                submissions: [
                    ...prev.submissions,
                    {
                        id: data.id,
                        wadURL: null,
                        wadName: data.wadName,
                        wadLevel: data.wadLevel,
                    } as unknown as Submission,
                ],
            };
        });
    }, []);

    const handleDeleteSubmission = useCallback((ids: number[]) => {
        setActiveRound(prev => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                submissions: prev.submissions.filter(s => !ids.includes(s.id)),
            };
        });
    }, []);

    useSocket(handleNewSubmission, handleDeleteSubmission);

    if (loading) {
        return null;
    }

    if (!activeRound && previousRounds.length === 0) {
        return (
            <div className={styles.noRounds}>
                <h2>No submission rounds have taken place.</h2>
                <p>Please come back when an announcement has been made!</p>
            </div>
        );
    }

    return (
        <>
            {activeRound && (
                <div className={styles.grid}>
                    <div className={styles.formCard} ref={formCardRef}>
                        <div className={styles.formHeader}>{activeRound.name}</div>
                        <div className={styles.formBody}>
                            {activeRound.paused && (
                                <div className={styles.pausedOverlay}>
                                    <span className={styles.pausedText}>Submissions are paused.</span>
                                </div>
                            )}
                            <SubmissionForm isPaused={activeRound.paused} />
                        </div>
                        <div className={styles.formFooter}>
                            Please contact <a href="mailto:submissions@vytaan.com">submissions@vytaan.com</a> if you
                            have any issues.
                        </div>
                    </div>
                    <div
                        className={styles.resultsCard}
                        style={resultsMaxHeight ? { maxHeight: resultsMaxHeight } : undefined}
                    >
                        <div className={styles.resultsHeader}>
                            <span>Current Submissions</span>
                            {connected ? (
                                <span className={styles.badgeSuccess}>Live Results</span>
                            ) : (
                                <span className={styles.badgeDanger}>Not Live Results</span>
                            )}
                        </div>
                        <div className={styles.resultsBody}>
                            <SubmissionsTable submissions={activeRound.submissions} />
                        </div>
                        {activeRound.endDate && (
                            <div className={styles.deadlineFooter}>
                                <span
                                    className={
                                        new Date(activeRound.endDate).setHours(23, 59, 59) < Date.now()
                                            ? styles.deadlineBadgeDanger
                                            : styles.deadlineBadgeInfo
                                    }
                                >
                                    Submission deadline: {new Date(activeRound.endDate).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeRound && (
                <div className={styles.section}>
                    <StatsPanel roundId={activeRound.id} />
                </div>
            )}

            {previousRounds.length > 0 && (
                <div className={styles.section}>
                    <ResultTabs rounds={previousRounds} />
                </div>
            )}
        </>
    );
}
