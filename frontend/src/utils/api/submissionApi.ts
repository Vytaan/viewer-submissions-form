import { API_BASE } from "../api";

export async function addEntry(formData: FormData, signal?: AbortSignal): Promise<unknown> {
    const response = await fetch(`${API_BASE}/submission/addEntry`, {
        method: "POST",
        credentials: "include",
        body: formData,
        signal,
    });

    if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message ?? "Failed to submit entry");
    }

    return response.json();
}

export async function modifyEntry(formData: FormData | URLSearchParams): Promise<unknown> {
    const response = await fetch(`${API_BASE}/submission/modifyEntry`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message ?? "Failed to modify entry");
    }

    return response.json();
}
