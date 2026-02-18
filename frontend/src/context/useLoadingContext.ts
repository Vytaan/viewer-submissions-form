import { createContext, useContext } from "react";

export interface LoadingContextType {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

export const LoadingContext = createContext<LoadingContextType | null>(null);

export function useLoadingContext() {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoadingContext must be used within LoadingProvider");
    }
    return context;
}
