import { API_BASE, apiPost } from "../api";

export async function login(
    email: string,
    password: string,
    captchaKey?: string,
    captchaResponse?: string,
): Promise<void> {
    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);
    if (captchaKey && captchaResponse) {
        formData.append(captchaKey, captchaResponse);
    }

    const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            Accept: "application/json",
        },
        body: formData,
        redirect: "manual",
    });

    if (response.type === "opaqueredirect" || response.status === 302) {
        return;
    }

    if (!response.ok) {
        let message = "Login failed";
        try {
            const body = await response.json();
            if (body.message) {
                message = body.message;
            }
        } catch {}
        throw new Error(message);
    }
}

export async function logout(): Promise<void> {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            credentials: "include",
            headers: { Accept: "application/json" },
        });
    } catch {}
}

export async function checkAuth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/submissionRound/currentActiveRound`, {
            credentials: "include",
        });
        if (response.status === 401 || response.status === 403) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

export async function changeDetails(email: string, password: string): Promise<void> {
    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("password", password);
    return apiPost("/auth/changeDetails", formData);
}
