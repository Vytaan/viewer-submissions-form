import { apiFetch } from "../api";

export type CaptchaType = "turnstile" | "reCAPTCHA" | "hCaptcha" | null;

export interface CaptchaConfig {
    captchaType: CaptchaType;
    siteKey: string | null;
}

export interface AppConfig {
    fileSizeLimit: number;
}

export async function getCaptchaConfig(): Promise<CaptchaConfig> {
    return apiFetch<CaptchaConfig>("/config/captcha");
}

export async function getAppConfig(): Promise<AppConfig> {
    return apiFetch<AppConfig>("/config/app");
}
