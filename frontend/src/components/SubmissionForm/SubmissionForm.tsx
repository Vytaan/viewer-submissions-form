import { useCallback, useRef, useState } from "react";
import { DoomEngine, DoomEngineLabels, GzDoomActionLabels } from "../../types/enums";
import { useConfigContext } from "../../context/useConfigContext";
import { useCaptcha, useSubmissions } from "../../hooks";
import { Captcha, type CaptchaHandle } from "../Captcha/Captcha";
import { getCaptchaBodyKey } from "../Captcha/captchaUtils";
import { BACKEND_BASE } from "../../utils/api";
import { WadMapAnalyser } from "../../utils/wadAnalyser";
import { Modal } from "../Modal/Modal";
import styles from "./SubmissionForm.module.scss";

interface SubmissionFormProps {
    isAdmin?: boolean;
    isPaused?: boolean;
    submissionId?: number;
    initialValues?: Record<string, unknown>;
    onSuccess?: () => void;
}

const engineEntries = Object.entries(DoomEngineLabels).filter(([key]) => key !== DoomEngine.UNKNOWN);
engineEntries.push([DoomEngine.UNKNOWN, DoomEngineLabels[DoomEngine.UNKNOWN]]);

export function SubmissionForm({
    isAdmin = false,
    isPaused = false,
    submissionId,
    initialValues,
    onSuccess,
}: SubmissionFormProps) {
    const config = useConfigContext();
    const { captchaType, siteKey, isEnabled: captchaEnabled } = useCaptcha();
    const { addEntry, modifyEntry } = useSubmissions();

    const [uploadMode, setUploadMode] = useState<"url" | "upload">("url");
    const [showGzActions, setShowGzActions] = useState(false);
    const [showDistributable, setShowDistributable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [fileSizeError, setFileSizeError] = useState(false);
    const [mapNames, setMapNames] = useState<string[]>([]);
    const [showLevelSelect, setShowLevelSelect] = useState(false);
    const [tosOpen, setTosOpen] = useState(false);

    const formRef = useRef<HTMLFormElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const captchaRef = useRef<CaptchaHandle>(null);
    const [captchaToken, setCaptchaToken] = useState("");

    const [wadUrl, setWadUrl] = useState((initialValues?.wadURL as string) ?? "");
    const [wadName, setWadName] = useState((initialValues?.wadName as string) ?? "");
    const [level, setLevel] = useState((initialValues?.wadLevel as string) ?? "");
    const [playTestEngine, setPlayTestEngine] = useState((initialValues?.playTestEngine as string) ?? "");
    const [engine, setEngine] = useState((initialValues?.wadEngine as string) ?? DoomEngine.DOOMII);
    const [gzActions, setGzActions] = useState<string[]>([]);
    const [authorName, setAuthorName] = useState((initialValues?.submitterName as string) ?? "");
    const [isAuthor, setIsAuthor] = useState((initialValues?.submitterAuthor as boolean) ?? false);
    const [distributable, setDistributable] = useState((initialValues?.distributable as boolean) ?? false);
    const [info, setInfo] = useState((initialValues?.info as string) ?? "");
    const [email, setEmail] = useState("");
    const [recordedFormat, setRecordedFormat] = useState((initialValues?.recordedFormat as string) ?? "Practised");

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) {
                return;
            }

            if (file.size > config.fileSizeLimit) {
                setFileSizeError(true);
                e.target.value = "";
                return;
            }
            setFileSizeError(false);

            const ext = file.name.split(".").pop()?.toLowerCase();
            if (ext === "wad") {
                try {
                    const analyser = await WadMapAnalyser.create(file);
                    if (analyser.mapNames.length > 0) {
                        setMapNames(analyser.mapNames);
                        setShowLevelSelect(true);
                        setLevel(analyser.mapNames[0]);
                        return;
                    }
                } catch {}
            }
            setShowLevelSelect(false);
            setMapNames([]);
        },
        [config.fileSizeLimit],
    );

    const handleEngineChange = useCallback((value: string) => {
        setEngine(value);
        const selectedLabel = DoomEngineLabels[value];
        setShowGzActions(selectedLabel === "GZDoom");
    }, []);

    const handleGzActionChange = useCallback((action: string, checked: boolean) => {
        setGzActions(prev => {
            if (checked) {
                return [...prev, action];
            }
            return prev.filter(a => a !== action);
        });
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);

            if (!formRef.current?.reportValidity()) {
                return;
            }

            if (uploadMode === "url" && !level) {
                setError("Please fill in the level to play");
                return;
            }

            const formData = new FormData();

            if (isAdmin && submissionId) {
                formData.set("id", String(submissionId));
            }

            if (uploadMode === "url") {
                formData.set("WAD", wadUrl);
            } else {
                const fileInput = formRef.current?.querySelector<HTMLInputElement>("input[type=file]");
                if (fileInput?.files?.[0]) {
                    formData.set("file", fileInput.files[0]);
                }
            }

            formData.set("WADName", wadName);
            formData.set("level", level);
            formData.set("engine", engine);
            formData.set("playTestEngine", playTestEngine);

            for (let i = 0; i < gzActions.length; i++) {
                formData.append("gzDoomAction[]", gzActions[i]);
            }

            formData.set("authorName", authorName);
            formData.set("author", String(isAuthor));
            formData.set("distributable", String(distributable));

            if (!isAdmin) {
                formData.set("info", info);
                formData.set("email", email);
            }

            formData.set("recordedFormat", recordedFormat);

            if (!isAdmin && captchaEnabled) {
                if (!captchaToken) {
                    setError("Please activate CAPTCHA.");
                    return;
                }
                const bodyKey = getCaptchaBodyKey(captchaType);
                if (bodyKey) {
                    formData.set(bodyKey, captchaToken);
                }
            }

            setLoading(true);
            abortControllerRef.current = new AbortController();

            try {
                if (isAdmin) {
                    const urlEncoded = new URLSearchParams();
                    for (const [key, value] of formData.entries()) {
                        urlEncoded.append(key, String(value));
                    }
                    await modifyEntry(urlEncoded);
                } else {
                    await addEntry(formData, abortControllerRef.current.signal);
                }
                setSuccess(true);
                setError(null);
                if (onSuccess) {
                    onSuccess();
                }
            } catch (err) {
                if (err instanceof DOMException && abortControllerRef.current?.signal.aborted) {
                    setError(abortControllerRef.current.signal.reason);
                } else {
                    setError(err instanceof Error ? err.message : "Submission failed");
                }
            } finally {
                setLoading(false);
                if (!isAdmin) {
                    captchaRef.current?.reset();
                    setCaptchaToken("");
                }
            }
        },
        [
            uploadMode,
            wadUrl,
            wadName,
            level,
            engine,
            playTestEngine,
            gzActions,
            authorName,
            isAuthor,
            distributable,
            info,
            email,
            recordedFormat,
            isAdmin,
            submissionId,
            captchaEnabled,
            captchaType,
            captchaToken,
            addEntry,
            modifyEntry,
            onSuccess,
        ],
    );

    return (
        <>
            <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
                {!isAdmin && (
                    <div className={styles.field}>
                        <span className={styles.label}>Post a link to the WAD below, or you can upload it.</span>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="uploadOrUrl"
                                    value="url"
                                    checked={uploadMode === "url"}
                                    onChange={() => setUploadMode("url")}
                                />
                                Link
                            </label>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="uploadOrUrl"
                                    value="upload"
                                    checked={uploadMode === "upload"}
                                    onChange={() => setUploadMode("upload")}
                                />
                                Upload
                            </label>
                        </div>
                    </div>
                )}

                {(isAdmin || uploadMode === "url") && (
                    <div className={styles.field}>
                        <label className={styles.label}>
                            WAD Download URL <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="url"
                            className={styles.input}
                            value={wadUrl}
                            onChange={e => setWadUrl(e.target.value)}
                            required={uploadMode === "url"}
                        />
                    </div>
                )}

                {!isAdmin && uploadMode === "upload" && (
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Upload WAD <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="file"
                            className={styles.input}
                            onChange={handleFileChange}
                            required={uploadMode === "upload"}
                        />
                        {fileSizeError && <div className={styles.alertDanger}>File is too big</div>}
                        <div className={styles.fileSizeWarning}>
                            Max file size: {Math.round(config.fileSizeLimit / 1048576)}MB
                        </div>
                    </div>
                )}

                <div className={styles.field}>
                    <label className={styles.label}>
                        Name of the WAD <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        className={styles.input}
                        value={wadName}
                        onChange={e => setWadName(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        Which level should I play? <span className={styles.required}>*</span>
                    </label>
                    {showLevelSelect ? (
                        <select className={styles.select} value={level} onChange={e => setLevel(e.target.value)}>
                            {mapNames.map(name => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            className={styles.input}
                            value={level}
                            onChange={e => setLevel(e.target.value)}
                        />
                    )}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        What source port did you play or test this map on? <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        className={styles.input}
                        value={playTestEngine}
                        onChange={e => setPlayTestEngine(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        Map compatibility <span className={styles.required}>*</span>
                    </label>
                    <select className={styles.select} value={engine} onChange={e => handleEngineChange(e.target.value)}>
                        {engineEntries.map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {!isAdmin && showGzActions && (
                    <div className={styles.field}>
                        <span className={styles.label}>
                            If GZDoom is required, am I allowed to jump, crouch, or mouse-look?
                        </span>
                        <div className={styles.checkboxGroup}>
                            {Object.entries(GzDoomActionLabels).map(([key, label]) => (
                                <label key={key} className={styles.radioLabel}>
                                    <input
                                        type="checkbox"
                                        checked={gzActions.includes(key)}
                                        onChange={e => handleGzActionChange(key, e.target.checked)}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.field}>
                    <label className={styles.label}>
                        Under what name would you like to submit? Leave empty to remain anonymous.
                    </label>
                    <input
                        type="text"
                        className={styles.input}
                        value={authorName}
                        onChange={e => setAuthorName(e.target.value)}
                        placeholder="anonymous"
                    />
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>
                        Did you make this level? <span className={styles.required}>*</span>
                    </span>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="author"
                                checked={isAuthor}
                                onChange={() => {
                                    setIsAuthor(true);
                                    setShowDistributable(true);
                                }}
                            />
                            Yes
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="author"
                                checked={!isAuthor}
                                onChange={() => {
                                    setIsAuthor(false);
                                    setShowDistributable(false);
                                }}
                            />
                            No
                        </label>
                    </div>
                </div>

                {showDistributable && (
                    <div className={styles.field}>
                        <span className={styles.label}>
                            If you've made the WAD, and it's not publicly available, am I allowed to provide it to
                            viewers?
                        </span>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="distributable"
                                    checked={distributable}
                                    onChange={() => setDistributable(true)}
                                />
                                Yes
                            </label>
                            <label className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="distributable"
                                    checked={!distributable}
                                    onChange={() => setDistributable(false)}
                                />
                                No
                            </label>
                        </div>
                    </div>
                )}

                {!isAdmin && (
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Tell me something about the level: its backstory, your inspiration, or about yourself.
                        </label>
                        <textarea
                            className={styles.textarea}
                            value={info}
                            onChange={e => setInfo(e.target.value)}
                            maxLength={4096}
                            rows={3}
                        />
                    </div>
                )}

                {!isAdmin && (
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Your email address (will be kept private) <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                )}

                <div className={styles.field}>
                    <span className={styles.label}>
                        Which recording format would you like? <span className={styles.required}>*</span>
                    </span>
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="recordedFormat"
                                value="Blind"
                                checked={recordedFormat === "Blind"}
                                onChange={() => setRecordedFormat("Blind")}
                            />
                            Blind
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="recordedFormat"
                                value="Practised"
                                checked={recordedFormat === "Practised"}
                                onChange={() => setRecordedFormat("Practised")}
                            />
                            Practised
                        </label>
                    </div>
                </div>

                {!isAdmin && captchaEnabled && (
                    <Captcha
                        ref={captchaRef}
                        captchaType={captchaType}
                        siteKey={siteKey!}
                        onVerify={setCaptchaToken}
                        onExpire={() => {
                            abortControllerRef.current?.abort("CAPTCHA expired");
                            setCaptchaToken("");
                        }}
                    />
                )}

                {!isAdmin && (
                    <div className={styles.alertInfo}>
                        By submitting, you agree to our{" "}
                        <span className={styles.tosLink} onClick={() => setTosOpen(true)}>
                            Privacy Policy
                        </span>
                    </div>
                )}

                {error && (
                    <div className={styles.alertDanger}>
                        <i className="bi bi-exclamation-triangle-fill" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className={styles.alertSuccess}>
                        <i className="bi bi-check-circle-fill" />
                        <span>
                            An email has been sent to the address provided. Please click the link in your email to
                            confirm your entry.
                            <strong> NOTE:</strong> this link will expire in 20 minutes.
                        </span>
                    </div>
                )}

                {!isAdmin && !isPaused && (
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading && <span className={styles.loadingSpinner} />}
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                )}
            </form>

            <Modal open={tosOpen} onClose={() => setTosOpen(false)} title="Privacy Policy" size="xl">
                <iframe
                    src={`${BACKEND_BASE}/tos`}
                    style={{ width: "100%", height: "500px", border: "none" }}
                    title="Privacy Policy"
                />
            </Modal>
        </>
    );
}
