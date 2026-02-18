export const DoomEngine = {
    DOOM: "3",
    DOOMII: "2",
    BOOM: "9",
    MBF: "11",
    MBF21: "21",
    GZDOOM: "-1",
    DOOM_64: "4",
    FINAL_DOOM: "5",
    NA: "0",
    UNKNOWN: "-2",
} as const;
export type DoomEngineValue = (typeof DoomEngine)[keyof typeof DoomEngine];

export const GzDoomAction = {
    JUMP: "0",
    CROUCH: "1",
    MOUSE_LOOK: "2",
} as const;
export type GzDoomActionValue = (typeof GzDoomAction)[keyof typeof GzDoomAction];

export const RecordedFormat = {
    BLIND: "Blind",
    PRACTISED: "Practised",
} as const;
export type RecordedFormatValue = (typeof RecordedFormat)[keyof typeof RecordedFormat];

export const SubmissionStatusType = {
    QUEUED: "Queued",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    REJECTED: "Rejected",
} as const;
export type SubmissionStatusValue = (typeof SubmissionStatusType)[keyof typeof SubmissionStatusType];

export const DoomEngineLabels: Record<string, string> = {
    [DoomEngine.UNKNOWN]: "I don't know",
    [DoomEngine.NA]: "N/A",
    [DoomEngine.GZDOOM]: "GZDoom",
    [DoomEngine.DOOM]: "Ultimate Doom",
    [DoomEngine.DOOMII]: "Doom II",
    [DoomEngine.FINAL_DOOM]: "Final Doom",
    [DoomEngine.BOOM]: "Boom",
    [DoomEngine.MBF]: "MBF",
    [DoomEngine.MBF21]: "MBF21",
    [DoomEngine.DOOM_64]: "Doom 64",
};

export const GzDoomActionLabels: Record<string, string> = {
    [GzDoomAction.JUMP]: "Jump",
    [GzDoomAction.CROUCH]: "Crouch",
    [GzDoomAction.MOUSE_LOOK]: "Mouse look",
};
