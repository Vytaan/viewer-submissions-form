import { Property } from "@tsed/schema";
import type { SubmissionModel } from "../model/db/Submission.model.js";

export class CurrentRoundSubmissionDto {
    @Property()
    public id: number;

    @Property()
    public wadName: string;

    @Property()
    public wadLevel: string;

    public static from(submission: SubmissionModel): CurrentRoundSubmissionDto {
        const dto = new CurrentRoundSubmissionDto();
        dto.id = submission.id;
        dto.wadName = submission.wadName;
        dto.wadLevel = submission.wadLevel;
        return dto;
    }
}
