import { type ReactNode, useState } from "react";
import type { SubmissionRound } from "../../types";
import { SubmissionsTable } from "../SubmissionsTable/SubmissionsTable";
import styles from "./ResultTabs.module.scss";

interface ResultTabsProps {
    rounds: SubmissionRound[];
    isAdmin?: boolean;
    onDeleteRound?: (roundId: number) => void;
    renderToolbar?: (selectedIds: number[], roundId: number) => ReactNode;
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export function ResultTabs({ rounds, isAdmin = false, onDeleteRound, renderToolbar }: ResultTabsProps) {
    const [activeTab, setActiveTab] = useState(rounds.length > 0 ? rounds[rounds.length - 1].id : 0);
    const [showAllMap, setShowAllMap] = useState<Record<number, boolean>>({});
    const [selectedIdsMap, setSelectedIdsMap] = useState<Record<string, number[]>>({});

    if (rounds.length === 0) {
        return null;
    }

    const activeRound = rounds.find(r => r.id === activeTab);

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.tabList}>
                    {rounds.map(round => (
                        <button
                            key={round.id}
                            className={activeTab === round.id ? styles.tabActive : styles.tab}
                            onClick={() => setActiveTab(round.id)}
                        >
                            {round.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className={styles.body}>
                {activeRound && (
                    <>
                        <div className={styles.toggleWrapper}>
                            <label className={styles.toggleLabel}>All submissions</label>
                            <input
                                type="checkbox"
                                className={styles.toggle}
                                checked={showAllMap[activeRound.id] ?? false}
                                onChange={e => setShowAllMap(prev => ({ ...prev, [activeRound.id]: e.target.checked }))}
                            />
                        </div>
                        <p className={styles.roundDate}>Start: {formatDate(activeRound.createdAt)}</p>
                        <SubmissionsTable
                            submissions={activeRound.submissions}
                            isAdmin={isAdmin}
                            isResults={true}
                            isPreviousResults={true}
                            selectable={isAdmin}
                            onSelectionChange={ids => setSelectedIdsMap(prev => ({ ...prev, [activeRound.id]: ids }))}
                            toolbar={
                                isAdmin && renderToolbar
                                    ? renderToolbar(selectedIdsMap[activeRound.id] ?? [], activeRound.id)
                                    : undefined
                            }
                        />
                        {(showAllMap[activeRound.id] ?? false) && (
                            <>
                                <hr style={{ borderColor: "#333", margin: "1rem 0" }} />
                                <SubmissionsTable
                                    submissions={activeRound.submissions}
                                    isAdmin={isAdmin}
                                    isResults={false}
                                    isPreviousResults={true}
                                    selectable={isAdmin}
                                    onSelectionChange={ids =>
                                        setSelectedIdsMap(prev => ({ ...prev, [`${activeRound.id}_all`]: ids }))
                                    }
                                    toolbar={
                                        isAdmin && renderToolbar
                                            ? renderToolbar(
                                                  selectedIdsMap[`${activeRound.id}_all`] ?? [],
                                                  activeRound.id,
                                              )
                                            : undefined
                                    }
                                />
                            </>
                        )}
                    </>
                )}
            </div>
            {isAdmin && activeRound && onDeleteRound && (
                <div className={styles.footer}>
                    <button className={styles.deleteBtn} onClick={() => onDeleteRound(activeRound.id)}>
                        Delete Round
                    </button>
                </div>
            )}
        </div>
    );
}
