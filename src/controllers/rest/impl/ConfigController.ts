import { Constant, Controller, Inject } from "@tsed/di";
import { Get, Returns } from "@tsed/schema";
import { StatusCodes } from "http-status-codes";
import { CaptchaManager } from "../../../manager/CaptchaManager.js";
import GlobalEnv from "../../../model/constants/GlobalEnv.js";

@Controller("/config")
export class ConfigController {
    @Inject()
    private captchaManager: CaptchaManager;

    @Constant(GlobalEnv.CAPTCHA_SITE_KEY)
    private readonly captchaSiteKey: string;

    @Constant(GlobalEnv.FILE_SIZE_UPLOAD_LIMIT_MB)
    private readonly fileSizeLimitMb: string;

    @Get("/captcha")
    @Returns(StatusCodes.OK)
    public getCaptchaConfig(): unknown {
        const captchaType = this.captchaManager.engine?.type ?? null;
        return {
            captchaType,
            siteKey: this.captchaSiteKey ?? null,
        };
    }

    @Get("/app")
    @Returns(StatusCodes.OK)
    public getAppConfig(): unknown {
        return {
            fileSizeLimit: Number.parseInt(this.fileSizeLimitMb) * 1048576,
        };
    }
}
