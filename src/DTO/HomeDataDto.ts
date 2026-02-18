import { CollectionOf, Nullable, Property } from "@tsed/schema";
import type { SubmissionRoundModel } from "../model/db/SubmissionRound.model.js";
import { CurrentRoundSubmissionDto } from "./CurrentRoundSubmissionDto.js";
import { PreviousRoundSubmissionDto } from "./PreviousRoundSubmissionDto.js";

class CurrentRoundDto {
    @Property()
    public id: number;

    @Property()
    public name: string;

    @Property()
    public active: boolean;

    @Property()
    public paused: boolean;

    @Property()
    @Nullable(Date)
    public endDate: Date | null;

    @Property()
    public createdAt: Date;

    @Property()
    @CollectionOf(CurrentRoundSubmissionDto)
    public submissions: CurrentRoundSubmissionDto[];

    public static from(round: SubmissionRoundModel): CurrentRoundDto {
        const dto = new CurrentRoundDto();
        dto.id = round.id;
        dto.name = round.name;
        dto.active = round.active;
        dto.paused = round.paused;
        dto.endDate = round.endDate;
        dto.createdAt = round.createdAt;
        dto.submissions = [];
        for (let i = 0; i < round.submissions.length; i++) {
            dto.submissions.push(CurrentRoundSubmissionDto.from(round.submissions[i]));
        }
        return dto;
    }
}

class PreviousRoundDto {
    @Property()
    public id: number;

    @Property()
    public name: string;

    @Property()
    public active: boolean;

    @Property()
    public paused: boolean;

    @Property()
    @Nullable(Date)
    public endDate: Date | null;

    @Property()
    public createdAt: Date;

    @Property()
    @CollectionOf(PreviousRoundSubmissionDto)
    public submissions: PreviousRoundSubmissionDto[];

    public static from(round: SubmissionRoundModel): PreviousRoundDto {
        const dto = new PreviousRoundDto();
        dto.id = round.id;
        dto.name = round.name;
        dto.active = round.active;
        dto.paused = round.paused;
        dto.endDate = round.endDate;
        dto.createdAt = round.createdAt;
        dto.submissions = [];
        for (let i = 0; i < round.submissions.length; i++) {
            dto.submissions.push(PreviousRoundSubmissionDto.from(round.submissions[i]));
        }
        return dto;
    }
}

class HomeModel {
    @Property()
    @Nullable(CurrentRoundDto)
    public currentActiveRound: CurrentRoundDto | null;

    @Property()
    @CollectionOf(PreviousRoundDto)
    public previousRounds: PreviousRoundDto[];
}

export class HomeDataDto {
    @Property()
    public model: HomeModel;

    public static from(
        currentActiveRound: SubmissionRoundModel | null,
        previousRounds: SubmissionRoundModel[],
    ): HomeDataDto {
        const dto = new HomeDataDto();
        dto.model = new HomeModel();
        dto.model.currentActiveRound = currentActiveRound ? CurrentRoundDto.from(currentActiveRound) : null;
        dto.model.previousRounds = [];
        for (let i = 0; i < previousRounds.length; i++) {
            dto.model.previousRounds.push(PreviousRoundDto.from(previousRounds[i]));
        }
        return dto;
    }
}
