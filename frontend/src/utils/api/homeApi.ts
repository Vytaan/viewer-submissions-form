import { apiFetch } from "../api";
import type { SubmissionRound } from "../../types";

interface HomeData {
    model: {
        currentActiveRound: SubmissionRound | null;
        previousRounds: SubmissionRound[];
    };
}

interface ConfirmationResult {
    message: string;
    success: boolean;
}

export async function getHomeData(): Promise<HomeData> {
    return apiFetch<HomeData>("/view/home");
}

export async function processConfirmation(uid: string): Promise<ConfirmationResult> {
    return apiFetch<ConfirmationResult>(`/view/processSubmission?uid=${encodeURIComponent(uid)}`);
}
