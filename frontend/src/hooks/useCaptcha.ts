import { useCallback, useEffect, useState } from "react";
import type { CaptchaType } from "../utils/api/configApi";
import * as configApi from "../utils/api/configApi";

interface CaptchaConfig {
    captchaType: CaptchaType;
    siteKey: string | null;
}

export function useCaptcha() {
    const [config, setConfig] = useState<CaptchaConfig>({ captchaType: null, siteKey: null });
    const [isLoading, setIsLoading] = useState(true);

    const fetchCaptchaConfig = useCallback(async () => {
        return configApi.getCaptchaConfig();
    }, []);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await fetchCaptchaConfig();
                setConfig(data);
            } catch {
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, [fetchCaptchaConfig]);

    return {
        captchaType: config.captchaType,
        siteKey: config.siteKey,
        isLoading,
        isEnabled: config.captchaType !== null && config.siteKey !== null,
    };
}
