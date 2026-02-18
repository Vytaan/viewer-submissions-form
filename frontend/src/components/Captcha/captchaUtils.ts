import type { CaptchaType } from "../../utils/api/configApi";

export function getCaptchaScriptUrl(captchaType: CaptchaType): string {
    switch (captchaType) {
        case "turnstile":
            return "https://challenges.cloudflare.com/turnstile/v0/api.js";
        case "reCAPTCHA":
            return "https://www.google.com/recaptcha/api.js?render=explicit";
        case "hCaptcha":
            return "https://js.hcaptcha.com/1/api.js?render=explicit";
        default:
            return "";
    }
}

export function getCaptchaBodyKey(captchaType: CaptchaType): string | null {
    switch (captchaType) {
        case "turnstile":
            return "cf-turnstile-response";
        case "reCAPTCHA":
            return "g-recaptcha-response";
        case "hCaptcha":
            return "h-captcha-response";
        default:
            return null;
    }
}
