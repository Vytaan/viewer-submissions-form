import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, useCaptcha } from "../../hooks";
import { useAuthContext } from "../../context/useAuthContext";
import { Captcha, type CaptchaHandle } from "../../components/Captcha/Captcha";
import { getCaptchaBodyKey } from "../../components/Captcha/captchaUtils";
import styles from "./Login.module.scss";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const { login } = useAuth();
    const { isAuthenticated } = useAuthContext();
    const { captchaType, siteKey, isEnabled: captchaEnabled } = useCaptcha();
    const captchaRef = useRef<CaptchaHandle>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated === true) {
            navigate("/admin", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setError(null);
            setLoading(true);

            try {
                let captchaKey: string | undefined;
                let captchaResponse: string | undefined;

                if (captchaEnabled) {
                    if (!captchaToken) {
                        setError("Please activate CAPTCHA.");
                        setLoading(false);
                        return;
                    }
                    const bodyKey = getCaptchaBodyKey(captchaType);
                    if (bodyKey) {
                        captchaKey = bodyKey;
                        captchaResponse = captchaToken;
                    }
                }

                await login(email, password, captchaKey, captchaResponse);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Login failed");
            } finally {
                setLoading(false);
                captchaRef.current?.reset();
                setCaptchaToken("");
            }
        },
        [email, password, captchaEnabled, captchaType, captchaToken, login],
    );

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>Login</div>
                <div className={styles.body}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label className={styles.label}>Email Address</label>
                            <input
                                type="email"
                                className={styles.input}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Password</label>
                            <input
                                type="password"
                                className={styles.input}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {captchaEnabled && (
                            <Captcha
                                ref={captchaRef}
                                captchaType={captchaType}
                                siteKey={siteKey!}
                                onVerify={setCaptchaToken}
                                onExpire={() => setCaptchaToken("")}
                            />
                        )}
                        {error && <div className={styles.error}>{error}</div>}
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? "Authenticating..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
