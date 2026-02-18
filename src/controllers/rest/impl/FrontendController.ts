import { Controller, Inject } from "@tsed/di";
import { Get, Returns } from "@tsed/schema";
import { StatusCodes } from "http-status-codes";
import { SubmissionRoundService } from "../../../services/SubmissionRoundService.js";
import { SubmissionRoundResultService } from "../../../services/SubmissionRoundResultService.js";
import { SubmissionConfirmationService } from "../../../services/SubmissionConfirmationService.js";
import { QueryParams } from "@tsed/platform-params";
import { NotFound } from "@tsed/exceptions";
import type { UUID } from "crypto";
import { HomeDataDto } from "../../../DTO/HomeDataDto.js";

@Controller("/")
export class FrontendController {
    @Inject()
    private submissionRoundService: SubmissionRoundService;

    @Inject()
    private submissionRoundResultService: SubmissionRoundResultService;

    @Inject()
    private submissionConfirmationService: SubmissionConfirmationService;

    @Get("/view/home")
    @Returns(StatusCodes.OK, HomeDataDto)
    public async getHomeData(): Promise<HomeDataDto> {
        const currentActiveRound = await this.submissionRoundService.getCurrentActiveSubmissionRound();
        const previousRounds = await this.submissionRoundResultService.getAllSubmissionRoundResults();
        return HomeDataDto.from(currentActiveRound, previousRounds);
    }

    @Get("/view/processSubmission")
    @Returns(StatusCodes.OK)
    public async processSubmission(@QueryParams("uid") uid: string): Promise<unknown> {
        const retStre = {
            message: "Your submission has been submitted and is awaiting manual verification...",
            success: true,
        };
        try {
            if (!uid) {
                throw new NotFound("No UID supplied.");
            }
            await this.submissionConfirmationService.processConfirmation(uid as UUID);
        } catch (e) {
            retStre.message = e.message;
            retStre.success = false;
        }
        return retStre;
    }
}
