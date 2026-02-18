import { useCallback } from "react";
import { apiFetch, apiPost } from "../utils/api";
import type { SubmissionRound } from "../types";

interface SuccessResponse {
    status: string;
}

export function useRounds() {
    const getCurrentActiveRound = useCallback(async (): Promise<SubmissionRound | null> => {
        try {
            return await apiFetch<SubmissionRound>("/submissionRound/currentActiveRound");
        } catch {
            return null;
        }
    }, []);

    const getCurrentActiveRoundAdmin = useCallback(async (): Promise<SubmissionRound | null> => {
        try {
            return await apiFetch<SubmissionRound>("/submissionRound/currentActiveRoundAdmin");
        } catch {
            return null;
        }
    }, []);

    const getAllRounds = useCallback(async (includeActive = false): Promise<SubmissionRound[]> => {
        return apiFetch<SubmissionRound[]>(`/submissionRound/getAllRounds?includeActive=${includeActive}`);
    }, []);

    const newRound = useCallback(async (name: string, endDate?: number) => {
        const encodedName = encodeURIComponent(name);
        let url = `/submissionRound/newRound?name=${encodedName}`;
        if (endDate) {
            url += `&endDate=${endDate}`;
        }
        return apiPost<SubmissionRound>(url);
    }, []);

    const pauseRound = useCallback(async (pause: boolean) => {
        return apiPost<SuccessResponse>(`/submissionRound/pauseRound?pause=${pause}`);
    }, []);

    const deleteRound = useCallback(async (roundId: number) => {
        return apiFetch<SuccessResponse>(`/submissionRound/${roundId}/deleteRound`, {
            method: "DELETE",
        });
    }, []);

    return {
        getCurrentActiveRound,
        getCurrentActiveRoundAdmin,
        getAllRounds,
        newRound,
        pauseRound,
        deleteRound,
    };
}
