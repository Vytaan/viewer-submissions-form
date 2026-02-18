import styles from "./Admin.module.scss";

interface AdminToolbarProps {
    selectedIds: number[];
    roundId?: number;
    onShowInfo?: (ids: number[]) => void;
    onModify?: (ids: number[]) => void;
    onSetFile?: (id: number) => void;
    onSetYouTube?: (id: number) => void;
    onChangeStatus?: (id: number, roundId: number) => void;
    onDelete?: (ids: number[]) => void;
    onVerify?: (ids: number[]) => void;
    onAddRandom?: (roundId: number) => void;
}

export function AdminToolbar({
    selectedIds,
    roundId,
    onShowInfo,
    onModify,
    onSetFile,
    onSetYouTube,
    onChangeStatus,
    onDelete,
    onVerify,
    onAddRandom,
}: AdminToolbarProps) {
    const hasSelection = selectedIds.length > 0;
    const isSingle = selectedIds.length === 1;

    return (
        <div className={styles.toolbar}>
            {hasSelection && (
                <>
                    {onVerify && (
                        <button className={styles.toolbarBtnSuccess} onClick={() => onVerify(selectedIds)}>
                            Verify ({selectedIds.length})
                        </button>
                    )}
                    {onShowInfo && (
                        <button className={styles.toolbarBtn} onClick={() => onShowInfo(selectedIds)}>
                            Full Info
                        </button>
                    )}
                    {onModify && (
                        <button className={styles.toolbarBtn} onClick={() => onModify(selectedIds)}>
                            Modify
                        </button>
                    )}
                    {onSetFile && isSingle && (
                        <button className={styles.toolbarBtn} onClick={() => onSetFile(selectedIds[0])}>
                            Set File
                        </button>
                    )}
                    {onChangeStatus && isSingle && roundId !== undefined && (
                        <button className={styles.toolbarBtn} onClick={() => onChangeStatus(selectedIds[0], roundId)}>
                            Change Status
                        </button>
                    )}
                    {onSetYouTube && isSingle && (
                        <button className={styles.toolbarBtn} onClick={() => onSetYouTube(selectedIds[0])}>
                            Set YouTube
                        </button>
                    )}
                    {onDelete && (
                        <button className={styles.toolbarBtnDanger} onClick={() => onDelete(selectedIds)}>
                            Delete ({selectedIds.length})
                        </button>
                    )}
                </>
            )}
            {onAddRandom && roundId !== undefined && (
                <button className={styles.toolbarBtnSuccess} onClick={() => onAddRandom(roundId)}>
                    Add Random Entry
                </button>
            )}
        </div>
    );
}
