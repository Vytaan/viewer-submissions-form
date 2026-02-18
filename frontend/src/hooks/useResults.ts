import { useCallback } from "react";
import { apiFetch, apiPost } from "../utils/api";
import type { Submission } from "../types";

interface SuccessResponse {
    status: string;
}

export function useResults() {
    const generateEntries = useCallback(async (count: number): Promise<Submission[]> => {
        return apiFetch<Submission[]>(`/submissionRoundResult/generateEntries?count=${count}`);
    }, []);

    const buildResultSet = useCallback(async (): Promise<SuccessResponse> => {
        return apiPost<SuccessResponse>("/submissionRoundResult/buildResultSet");
    }, []);

    const submitEntries = useCallback(async (ids: number[]): Promise<SuccessResponse> => {
        return apiPost<SuccessResponse>("/submissionRoundResult/submitEntries", ids);
    }, []);

    const addRandomEntry = useCallback(async (roundId: number): Promise<Submission> => {
        return apiPost<Submission>(`/submissionRoundResult/addRandomEntry?roundId=${roundId}`);
    }, []);

    return {
        generateEntries,
        buildResultSet,
        submitEntries,
        addRandomEntry,
    };
}
