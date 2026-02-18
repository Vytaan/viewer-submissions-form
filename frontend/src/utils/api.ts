const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";

export const API_BASE = `${BACKEND_URL}/rest`;
export const BACKEND_BASE = BACKEND_URL;

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    const response = await fetch(url, {
        ...options,
        credentials: "include",
    });

    if (!response.ok) {
        let message = `Request failed: ${response.status}`;
        try {
            const body = await response.json();
            if (body.message) {
                message = body.message;
            }
        } catch {}
        throw new Error(message);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }

    return undefined as unknown as T;
}

export async function apiPost<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {};
    let resolvedBody: BodyInit | undefined;

    if (body instanceof FormData || body instanceof URLSearchParams) {
        resolvedBody = body;
    } else if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        headers["Accept"] = "application/json";
        resolvedBody = JSON.stringify(body);
    }

    return apiFetch<T>(path, {
        method: "POST",
        headers: { ...headers, ...options?.headers },
        body: resolvedBody,
        ...options,
    });
}

export async function apiDelete<T>(path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };

    return apiFetch<T>(path, {
        method: "DELETE",
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
}
