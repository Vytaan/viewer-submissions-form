import { useCallback, useState } from "react";
import { useResults } from "../../hooks";
import { useLoadingContext } from "../../context/useLoadingContext";
import { useToast } from "../Toast/useToast";
import styles from "./EndRoundWizard.module.scss";

interface EndRoundWizardProps {
    isPaused: boolean;
    onPause: () => Promise<void>;
    onFinish: () => void;
}

interface WizardEntry {
    id: number;
    wadName: string;
    level: string;
    submitter: string;
    author: boolean;
    selected: boolean;
}

export function EndRoundWizard({ isPaused, onPause, onFinish }: EndRoundWizardProps) {
    const [step, setStep] = useState(0);
    const [entries, setEntries] = useState<WizardEntry[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const { generateEntries, buildResultSet, submitEntries } = useResults();
    const { withLoading } = useLoadingContext();
    const { showToast } = useToast();

    const stepLabels = ["Pause Round", "Select Winners", "Review"];

    const handleNext = useCallback(async () => {
        if (step === 0) {
            if (!isPaused) {
                showToast("Please pause the round first", "warning");
                return;
            }
            await withLoading(async () => {
                try {
                    await buildResultSet();
                } catch (err) {
                    showToast(err instanceof Error ? err.message : "Failed to build result set", "error");
                    return;
                }
            });
            setStep(1);
        } else if (step === 1) {
            const ids = new Set<number>();
            let hasDupes = false;
            for (let i = 0; i < entries.length; i++) {
                if (ids.has(entries[i].id)) {
                    hasDupes = true;
                    break;
                }
                ids.add(entries[i].id);
            }
            if (hasDupes) {
                showToast("Please remove duplicate entries to proceed.", "warning");
                return;
            }
            if (entries.length === 0) {
                showToast("No entries in table", "warning");
                return;
            }
            setStep(2);
        }
    }, [step, isPaused, entries, withLoading, buildResultSet, showToast]);

    const handlePrev = useCallback(() => {
        if (step > 0) {
            setStep(step - 1);
        }
    }, [step]);

    const handleGenerateEntry = useCallback(async () => {
        await withLoading(async () => {
            try {
                const results = await generateEntries(1);
                if (results.length === 0) {
                    return;
                }
                const entry = results[0];
                setEntries(prev => [
                    ...prev,
                    {
                        id: entry.id,
                        wadName: entry.wadName,
                        level: entry.wadLevel,
                        submitter: entry.submitterName ?? "anonymous",
                        author: entry.submitterAuthor,
                        selected: false,
                    },
                ]);
            } catch (err) {
                showToast(err instanceof Error ? err.message : "Failed to generate entry", "error");
            }
        });
    }, [withLoading, generateEntries, showToast]);

    const handleRegenerate = useCallback(async () => {
        const selected = Array.from(selectedIndices);
        if (selected.length === 0) {
            return;
        }
        await withLoading(async () => {
            try {
                const results = await generateEntries(selected.length);
                setEntries(prev => {
                    const newEntries = [...prev];
                    for (let i = 0; i < selected.length && i < results.length; i++) {
                        const entry = results[i];
                        newEntries[selected[i]] = {
                            id: entry.id,
                            wadName: entry.wadName,
                            level: entry.wadLevel,
                            submitter: entry.submitterName ?? "anonymous",
                            author: entry.submitterAuthor,
                            selected: false,
                        };
                    }
                    return newEntries;
                });
                setSelectedIndices(new Set());
            } catch (err) {
                showToast(err instanceof Error ? err.message : "Failed to regenerate", "error");
            }
        });
    }, [selectedIndices, withLoading, generateEntries, showToast]);

    const handleRemoveSelected = useCallback(() => {
        const selected = Array.from(selectedIndices).sort((a, b) => b - a);
        setEntries(prev => {
            const newEntries = [...prev];
            for (let i = 0; i < selected.length; i++) {
                newEntries.splice(selected[i], 1);
            }
            return newEntries;
        });
        setSelectedIndices(new Set());
    }, [selectedIndices]);

    const toggleSelect = useCallback((index: number) => {
        setSelectedIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    }, []);

    const handleFinish = useCallback(async () => {
        const ids = entries.map(e => e.id);
        await withLoading(async () => {
            try {
                await submitEntries(ids);
                onFinish();
            } catch (err) {
                showToast(err instanceof Error ? err.message : "Failed to submit entries", "error");
            }
        });
    }, [entries, withLoading, submitEntries, onFinish, showToast]);

    const dupeIds = new Set<number>();
    const seen = new Set<number>();
    for (let i = 0; i < entries.length; i++) {
        if (seen.has(entries[i].id)) {
            dupeIds.add(entries[i].id);
        }
        seen.add(entries[i].id);
    }

    return (
        <div>
            <div className={styles.steps}>
                {stepLabels.map((label, i) => (
                    <div
                        key={label}
                        className={i === step ? styles.stepActive : i < step ? styles.stepComplete : styles.step}
                    >
                        {label}
                    </div>
                ))}
            </div>

            <div className={styles.content}>
                {step === 0 && (
                    <>
                        {isPaused ? (
                            <div className={styles.alertSuccess}>
                                <i className="bi bi-check-circle" /> Round is paused
                            </div>
                        ) : (
                            <>
                                <div className={styles.alertWarning}>
                                    <i className="bi bi-exclamation-triangle" /> In order to finish this round and pick
                                    winners, you must first pause the current active round.
                                </div>
                                <div className={styles.alertWarning}>
                                    Please pause the round to continue.
                                    <button className={styles.pauseBtn} onClick={onPause}>
                                        Pause Round
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}

                {step === 1 && (
                    <>
                        <div className={styles.toolbar}>
                            <button className={styles.toolbarBtn} onClick={handleGenerateEntry}>
                                Generate Random Entry
                            </button>
                            {selectedIndices.size > 0 && (
                                <>
                                    <button className={styles.toolbarBtn} onClick={handleRegenerate}>
                                        Re-generate ({selectedIndices.size})
                                    </button>
                                    <button className={styles.toolbarBtnDanger} onClick={handleRemoveSelected}>
                                        Remove ({selectedIndices.size})
                                    </button>
                                </>
                            )}
                        </div>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }} />
                                    <th>WAD</th>
                                    <th>Level</th>
                                    <th>Submitter</th>
                                    <th>Author</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, i) => (
                                    <tr
                                        key={`${entry.id}-${i}`}
                                        className={`${selectedIndices.has(i) ? styles.selectedRow : ""} ${dupeIds.has(entry.id) ? styles.dupeRow : ""}`}
                                        onClick={() => toggleSelect(i)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIndices.has(i)}
                                                onChange={() => toggleSelect(i)}
                                            />
                                        </td>
                                        <td>{entry.wadName}</td>
                                        <td>{entry.level}</td>
                                        <td>{entry.submitter}</td>
                                        <td>{String(entry.author)}</td>
                                    </tr>
                                ))}
                                {entries.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                                            No entries yet. Click "Generate Random Entry" to add.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className={styles.alertInfo}>
                            Review the selected entries here. Once you finish, this will end the current round and
                            confirm the entries.
                        </div>
                        <table className={styles.reviewTable}>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>WAD</th>
                                    <th>Level</th>
                                    <th>Submitter</th>
                                    <th>Author</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, i) => (
                                    <tr key={`${entry.id}-${i}`}>
                                        <td>{i + 1}</td>
                                        <td>{entry.wadName}</td>
                                        <td>{entry.level}</td>
                                        <td>{entry.submitter}</td>
                                        <td>{String(entry.author)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>

            <div className={styles.navigation}>
                <button className={styles.prevBtn} onClick={handlePrev} disabled={step === 0}>
                    Previous
                </button>
                <div>
                    {step < 2 ? (
                        <button className={styles.nextBtn} onClick={handleNext}>
                            Next
                        </button>
                    ) : (
                        <button className={styles.finishBtn} onClick={handleFinish}>
                            Finish
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
