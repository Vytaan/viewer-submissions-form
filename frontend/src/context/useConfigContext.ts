import { createContext, useContext } from "react";
import type { AppConfig } from "../types";

export const ConfigContext = createContext<AppConfig | null>(null);

export function useConfigContext() {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error("useConfigContext must be used within ConfigProvider");
    }
    return context;
}
