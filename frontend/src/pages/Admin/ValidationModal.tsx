import { useCallback, useState } from "react";
import { useWadValidation } from "../../hooks/useWadValidation";
import { useLoadingContext } from "../../context/useLoadingContext";
import { useToast } from "../../components/Toast/useToast";
import type { WadValidationMapping } from "../../types";
import { Modal } from "../../components/Modal/Modal";
import styles from "./Admin.module.scss";

interface ValidationModalProps {
    open: boolean;
    onClose: () => void;
    initialMapping: WadValidationMapping | null;
}

export function ValidationModal({ open, onClose, initialMapping }: ValidationModalProps) {
    const { setValidation } = useWadValidation();
    const { withLoading } = useLoadingContext();
    const { showToast } = useToast();
    const [mapping, setMapping] = useState<WadValidationMapping | null>(null);
    const [prevOpen, setPrevOpen] = useState(false);

    if (open && !prevOpen) {
        setPrevOpen(true);
        if (initialMapping) {
            setMapping({ ...initialMapping });
        }
    }
    if (!open && prevOpen) {
        setPrevOpen(false);
    }

    const handleSave = useCallback(async () => {
        if (!mapping) {
            return;
        }
        const encoded = { ...mapping };
        const encodedHeaders: (string | null)[] = [];
        for (let i = 0; i < mapping.allowedHeaders.length; i++) {
            const h = mapping.allowedHeaders[i];
            if (h) {
                encodedHeaders.push(encodeURIComponent(h));
            } else {
                encodedHeaders.push(h);
            }
        }
        encoded.allowedHeaders = encodedHeaders;

        const encodedHeadersZip: (string | null)[] = [];
        for (let i = 0; i < mapping.allowedHeadersZip.length; i++) {
            const h = mapping.allowedHeadersZip[i];
            if (h) {
                encodedHeadersZip.push(encodeURIComponent(h));
            } else {
                encodedHeadersZip.push(h);
            }
        }
        encoded.allowedHeadersZip = encodedHeadersZip;

        await withLoading(async () => {
            try {
                await setValidation(encoded);
                showToast("Mappings saved successfully", "success");
            } catch (err) {
                showToast(err instanceof Error ? err.message : "Failed", "error");
            }
        });
    }, [withLoading, setValidation, mapping, showToast]);

    const updateExt = useCallback((index: number, value: string) => {
        setMapping(prev => {
            if (!prev) {
                return prev;
            }
            const exts = [...prev.allowedExtensions];
            exts[index] = value;
            return { ...prev, allowedExtensions: exts };
        });
    }, []);

    const updateHeader = useCallback((index: number, value: string) => {
        setMapping(prev => {
            if (!prev) {
                return prev;
            }
            const headers = [...prev.allowedHeaders];
            headers[index] = value || null;
            return { ...prev, allowedHeaders: headers };
        });
    }, []);

    const removeEntry = useCallback((index: number) => {
        setMapping(prev => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                allowedExtensions: prev.allowedExtensions.filter((_, idx) => idx !== index),
                allowedHeaders: prev.allowedHeaders.filter((_, idx) => idx !== index),
            };
        });
    }, []);

    const addEntry = useCallback(() => {
        setMapping(prev => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                allowedExtensions: [...prev.allowedExtensions, ""],
                allowedHeaders: [...prev.allowedHeaders, null],
            };
        });
    }, []);

    const updateExtZip = useCallback((index: number, value: string) => {
        setMapping(prev => {
            if (!prev) {
                return prev;
            }
            const exts = [...prev.allowedExtensionsZip];
            exts[index] = value;
            return { ...prev, allowedExtensionsZip: exts };
        });
    }, []);

    const updateHeaderZip = useCallback((index: number, value: string) => {
        setMapping(prev => {
            if (!prev) {
                return prev;
            }
            const headers = [...prev.allowedHeadersZip];
            headers[index] = value || null;
            return { ...prev, allowedHeadersZip: headers };
        });
    }, []);

    const removeEntryZip = useCallback((index: number) => {
        setMapping(prev => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                allowedExtensionsZip: prev.allowedExtensionsZip.filter((_, idx) => idx !== index),
                allowedHeadersZip: prev.allowedHeadersZip.filter((_, idx) => idx !== index),
            };
        });
    }, []);

    const addEntryZip = useCallback(() => {
        setMapping(prev => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                allowedExtensionsZip: [...prev.allowedExtensionsZip, ""],
                allowedHeadersZip: [...prev.allowedHeadersZip, null],
            };
        });
    }, []);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Define WAD Validation Mappings"
            size="xl"
            footer={
                <button className={styles.btn} onClick={handleSave}>
                    Submit
                </button>
            }
        >
            {mapping && (
                <div className={styles.cardGroup}>
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>Non-Zip Files</div>
                        <div className={styles.sectionBody}>
                            {mapping.allowedExtensions.map((ext, i) => (
                                <div key={i} className={styles.mappingRow}>
                                    <span className={styles.inputGroupText}>Ext:</span>
                                    <input
                                        className={styles.mappingInput}
                                        value={ext}
                                        onChange={e => updateExt(i, e.target.value)}
                                    />
                                    <span className={styles.inputGroupText}>Header:</span>
                                    <input
                                        className={styles.mappingInput}
                                        value={mapping.allowedHeaders[i] ?? ""}
                                        placeholder="null"
                                        onChange={e => updateHeader(i, e.target.value)}
                                    />
                                    <button className={styles.removeMappingBtn} onClick={() => removeEntry(i)}>
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button className={styles.toolbarBtnSuccess} onClick={addEntry}>
                                Add Entry
                            </button>
                        </div>
                    </div>
                    <div className={styles.sectionCard}>
                        <div className={styles.sectionHeader}>Zip Files</div>
                        <div className={styles.sectionBody}>
                            {mapping.allowedExtensionsZip.map((ext, i) => (
                                <div key={i} className={styles.mappingRow}>
                                    <span className={styles.inputGroupText}>Ext:</span>
                                    <input
                                        className={styles.mappingInput}
                                        value={ext}
                                        onChange={e => updateExtZip(i, e.target.value)}
                                    />
                                    <span className={styles.inputGroupText}>Header:</span>
                                    <input
                                        className={styles.mappingInput}
                                        value={mapping.allowedHeadersZip[i] ?? ""}
                                        placeholder="null"
                                        onChange={e => updateHeaderZip(i, e.target.value)}
                                    />
                                    <button className={styles.removeMappingBtn} onClick={() => removeEntryZip(i)}>
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button className={styles.toolbarBtnSuccess} onClick={addEntryZip}>
                                Add Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
