import { useCallback } from "react";
import { apiFetch } from "../utils/api";
import type { PublicStats } from "../types";

export function useStats() {
    const getStats = useCallback(async (roundId: number): Promise<PublicStats | null> => {
        try {
            return await apiFetch<PublicStats>(`/stats/${roundId}`);
        } catch {
            return null;
        }
    }, []);

    return { getStats };
}
