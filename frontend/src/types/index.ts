import type { DoomEngineValue, GzDoomActionValue, RecordedFormatValue, SubmissionStatusValue } from "./enums";

export interface SubmissionStatus {
    id: number;
    status: SubmissionStatusValue;
    additionalInfo: string | null;
    submissionId: number;
}

export interface Submission {
    id: number;
    wadURL: string | null;
    wadName: string;
    wadLevel: string;
    wadEngine: DoomEngineValue;
    playTestEngine: string | null;
    gzDoomActions: GzDoomActionValue[] | null;
    submitterName: string | null;
    submitterAuthor: boolean;
    distributable: boolean;
    info: string | null;
    submitterEmail: string;
    recordedFormat: RecordedFormatValue;
    customWadFileName: string | null;
    verified: boolean;
    submissionValid: boolean;
    isChosen: boolean;
    playOrder: number | null;
    youtubeLink: string | null;
    status: SubmissionStatus | null;
    submissionRoundId: number;
}

export interface SubmissionRound {
    id: number;
    name: string;
    active: boolean;
    paused: boolean;
    endDate: string | null;
    createdAt: string;
    submissions: Submission[];
}

export interface PublicStats {
    mostSubmittedWad: string;
    mostSubmittedWadPercentage: number;
    recordFormat: Record<string, number>;
    isAuthor: Record<string, number>;
    distributable: Record<string, number>;
}

export interface AppConfig {
    fileSizeLimit: number;
}

export interface WadValidationMapping {
    allowedExtensions: string[];
    allowedHeaders: (string | null)[];
    allowedExtensionsZip: string[];
    allowedHeadersZip: (string | null)[];
}
