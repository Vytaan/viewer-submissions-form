import { Controller, Inject, ProviderScope, Scope } from "@tsed/di";
import { Authenticate, Authorize } from "@tsed/passport";
import { Get, Post, Returns, Security } from "@tsed/schema";
import { PlatformResponse, Req, Res } from "@tsed/platform-http";
import { UseBefore } from "@tsed/platform-middlewares";
import { StatusCodes } from "http-status-codes";
import { BodyParams } from "@tsed/platform-params";
import { UserModel } from "../../../../model/db/User.model.js";
import { UserService } from "../../../../services/UserService.js";
import { BaseRestController } from "../../BaseRestController.js";
import { CustomUserInfoModel } from "../../../../model/auth/CustomUserInfoModel.js";
import { CaptchaMiddleWare } from "../../../../middleware/endpoint/CaptchaMiddleWare.js";

@Controller("/auth")
@Scope(ProviderScope.SINGLETON)
export class PassportCtrl extends BaseRestController {
    @Inject()
    private usersService: UserService;

    @Post("/login")
    @UseBefore(CaptchaMiddleWare)
    @Authenticate("login", { failWithError: true })
    @Returns(StatusCodes.MOVED_TEMPORARILY)
    @Returns(StatusCodes.OK)
    @Returns(StatusCodes.UNAUTHORIZED)
    public login(@Req() req: Req, @Res() res: Res): void {
        if (req.headers.accept?.includes("application/json")) {
            res.status(StatusCodes.OK).json({ success: true });
            return;
        }
        res.redirect("/secure");
    }

    @Get("/logout")
    @Returns(StatusCodes.MOVED_TEMPORARILY)
    @Returns(StatusCodes.OK)
    public logout(@Req() request: Req, @Res() res: Res): void {
        request.session.destroy(function () {
            if (request.headers.accept?.includes("application/json")) {
                res.status(StatusCodes.OK).json({ success: true });
                return;
            }
            res.redirect("/");
        });
    }

    @Post("/changeDetails")
    @Authorize("login")
    @Security("login")
    @Returns(StatusCodes.OK)
    public async changeDetails(
        @Res() res: PlatformResponse,
        @Req() req: Req,
        @BodyParams() userDetails: UserModel,
    ): Promise<PlatformResponse> {
        const loggedInUser = req.user as CustomUserInfoModel;
        await this.usersService.changeDetails(userDetails, loggedInUser);
        return this.doSuccess(res, "User details changed");
    }
}
