import { useCallback } from "react";
import { apiDelete, apiFetch, apiPost } from "../utils/api";
import * as submissionApi from "../utils/api/submissionApi";
import type { Submission } from "../types";

interface SuccessResponse {
    status: string;
}

export function useSubmissions() {
    const addEntry = useCallback(async (formData: FormData, signal?: AbortSignal) => {
        return submissionApi.addEntry(formData, signal);
    }, []);

    const modifyEntry = useCallback(async (formData: FormData | URLSearchParams) => {
        return submissionApi.modifyEntry(formData);
    }, []);

    const getSubmission = useCallback(async (id: number): Promise<Submission> => {
        return apiFetch<Submission>(`/submission/getSubmission/${id}`);
    }, []);

    const changeStatus = useCallback(async (submissionId: number, status: string, additionalInfo?: string) => {
        const formData = new URLSearchParams();
        formData.append("submissionId", String(submissionId));
        formData.append("status", status);
        if (additionalInfo) {
            formData.append("additionalInfo", additionalInfo);
        }
        return apiPost<SuccessResponse>("/submission/changeStatus", formData);
    }, []);

    const setYoutubeLink = useCallback(async (submissionId: number, link?: string) => {
        let endpoint = `/submission/${submissionId}/setYoutubeLink?link`;
        if (link) {
            const encodedLink = encodeURIComponent(`https://www.youtube.com/${link}`);
            endpoint = `/submission/${submissionId}/setYoutubeLink?link=${encodedLink}`;
        }
        return apiPost<SuccessResponse>(endpoint);
    }, []);

    const deleteEntries = useCallback(async (ids: number[]) => {
        return apiDelete<SuccessResponse>("/submission/deleteEntries", ids);
    }, []);

    const verifyEntries = useCallback(async (ids: number[]) => {
        return apiPost<SuccessResponse>("/submission/verifyEntries", ids);
    }, []);

    const setFile = useCallback(async (submissionId: number, file: File) => {
        const formData = new FormData();
        formData.set("id", String(submissionId));
        formData.set("file", file);
        return apiPost<Submission>("/submission/modifyEntry", formData);
    }, []);

    return {
        addEntry,
        modifyEntry,
        getSubmission,
        changeStatus,
        setYoutubeLink,
        deleteEntries,
        verifyEntries,
        setFile,
    };
}
