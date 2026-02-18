import { Nullable, Property } from "@tsed/schema";
import type { SubmissionModel } from "../model/db/Submission.model.js";
import type { SubmissionStatusModel } from "../model/db/SubmissionStatus.model.js";
import type RecordedFormat from "../model/constants/RecordedFormat.js";

class SubmissionStatusDto {
    @Property()
    public status: string;

    @Property()
    @Nullable(String)
    public additionalInfo: string | null;

    @Property()
    public submissionId: number;
}

export class PreviousRoundSubmissionDto {
    @Property()
    public id: number;

    @Property()
    public wadName: string;

    @Property()
    public wadLevel: string;

    @Property()
    @Nullable(String)
    public wadURL: string | null;

    @Property()
    @Nullable(String)
    public customWadFileName: string | null;

    @Property()
    @Nullable(String)
    public submitterName: string | null;

    @Property()
    public isChosen: boolean;

    @Property()
    @Nullable(Number)
    public playOrder: number | null;

    @Property()
    @Nullable(String)
    public youtubeLink: string | null;

    @Property()
    @Nullable(SubmissionStatusDto)
    public status: SubmissionStatusDto | null;

    @Property()
    public recordedFormat: RecordedFormat;

    @Property()
    public submissionRoundId: number;

    private static mapStatus(status: SubmissionStatusModel | null): SubmissionStatusDto | null {
        if (!status) {
            return null;
        }
        const dto = new SubmissionStatusDto();
        dto.status = status.status;
        dto.additionalInfo = status.additionalInfo ?? null;
        dto.submissionId = status.submissionId;
        return dto;
    }

    public static from(submission: SubmissionModel): PreviousRoundSubmissionDto {
        const dto = new PreviousRoundSubmissionDto();
        dto.id = submission.id;
        dto.wadName = submission.wadName;
        dto.wadLevel = submission.wadLevel;
        dto.wadURL = submission.wadURL;
        dto.customWadFileName = submission.customWadFileName;
        dto.submitterName = submission.submitterName;
        dto.isChosen = submission.isChosen;
        dto.playOrder = submission.playOrder;
        dto.youtubeLink = submission.youtubeLink;
        dto.status = PreviousRoundSubmissionDto.mapStatus(submission.status);
        dto.recordedFormat = submission.recordedFormat;
        dto.submissionRoundId = submission.submissionRoundId;
        return dto;
    }
}
