import { type ReactNode, useEffect, useState } from "react";
import type { AppConfig } from "../types";
import * as configApi from "../utils/api/configApi";
import { ConfigContext } from "./useConfigContext";

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<AppConfig | null>(null);

    useEffect(() => {
        async function fetchConfig() {
            try {
                const data = await configApi.getAppConfig();
                setConfig(data);
            } catch {
                setConfig({
                    fileSizeLimit: 100 * 1048576,
                });
            }
        }
        fetchConfig();
    }, []);

    if (!config) {
        return null;
    }

    return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}
