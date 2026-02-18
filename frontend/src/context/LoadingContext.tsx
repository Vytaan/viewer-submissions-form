import { type ReactNode, useCallback, useState } from "react";
import { LoadingContext } from "./useLoadingContext";

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setLoading] = useState(false);

    const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
        setLoading(true);
        try {
            return await fn();
        } finally {
            setLoading(false);
        }
    }, []);

    return <LoadingContext.Provider value={{ isLoading, setLoading, withLoading }}>{children}</LoadingContext.Provider>;
}
