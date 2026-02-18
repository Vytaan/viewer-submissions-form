import React, { useMemo, useState } from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type RowSelectionState,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import type { Submission } from "../../types";
import { SubmissionStatusType } from "../../types/enums";
import { BACKEND_BASE } from "../../utils/api";
import styles from "./SubmissionsTable.module.scss";

interface SubmissionsTableProps {
    submissions: Submission[];
    isAdmin?: boolean;
    isResults?: boolean;
    isPreviousResults?: boolean;
    selectable?: boolean;
    onSelectionChange?: (selectedIds: number[]) => void;
    toolbar?: React.ReactNode;
}

function getStatusClass(status: string): string {
    switch (status) {
        case SubmissionStatusType.QUEUED:
            return styles.statusQueued;
        case SubmissionStatusType.IN_PROGRESS:
            return styles.statusInProgress;
        case SubmissionStatusType.COMPLETED:
            return styles.statusCompleted;
        case SubmissionStatusType.REJECTED:
            return styles.statusRejected;
        default:
            return "";
    }
}

export function SubmissionsTable({
    submissions,
    isAdmin = false,
    isResults = false,
    isPreviousResults = false,
    selectable = false,
    onSelectionChange,
    toolbar,
}: SubmissionsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const filteredSubmissions = useMemo(() => {
        if (isResults) {
            return submissions.filter(s => s.isChosen).sort((a, b) => (a.playOrder ?? 0) - (b.playOrder ?? 0));
        }
        return submissions.filter(s => !s.isChosen).sort((a, b) => a.id - b.id);
    }, [submissions, isResults]);

    const columns = useMemo<ColumnDef<Submission>[]>(() => {
        const cols: ColumnDef<Submission>[] = [];

        if (isAdmin) {
            cols.push({
                accessorKey: "id",
                header: "ID",
                size: 60,
            });
        }

        if (isResults) {
            cols.push({
                id: "playOrder",
                header: "Play Order",
                cell: ({ row }) => row.index + 1,
                size: 80,
            });
        } else {
            cols.push({
                id: "number",
                header: "No.",
                cell: ({ row }) => row.index + 1,
                size: 60,
            });
        }

        cols.push(
            {
                accessorKey: "wadName",
                header: "WAD",
            },
            {
                accessorKey: "wadLevel",
                header: "Level",
            },
        );

        if (isAdmin || (isPreviousResults && isResults)) {
            cols.push({
                id: "submitterName",
                header: "Submitter",
                accessorFn: row => row.submitterName ?? "anonymous",
            });
        }

        if (isAdmin) {
            cols.push(
                {
                    id: "wadEngine",
                    header: "WAD Engine",
                    accessorFn: row => row.wadEngine,
                },
                {
                    id: "gzDoomActions",
                    header: "GzDoom Actions",
                    accessorFn: row => {
                        if (!row.gzDoomActions || row.gzDoomActions.length === 0) {
                            return "";
                        }
                        return row.gzDoomActions.join(", ");
                    },
                },
                {
                    id: "isAuthor",
                    header: "Author",
                    accessorFn: row => String(row.submitterAuthor),
                },
                {
                    id: "distributable",
                    header: "Distributable",
                    accessorFn: row => String(row.distributable),
                },
                {
                    id: "info",
                    header: "Info",
                    accessorFn: row => row.info,
                    cell: ({ getValue }) => {
                        const val = getValue() as string;
                        if (!val) {
                            return "";
                        }
                        if (val.length > 50) {
                            return val.substring(0, 50) + "...";
                        }
                        return val;
                    },
                },
            );
        }

        if (isPreviousResults) {
            cols.push({
                id: "download",
                header: "Download",
                cell: ({ row }) => {
                    const sub = row.original;
                    const hasDownload = sub.wadURL || sub.customWadFileName;
                    if (!hasDownload) {
                        return "N/A";
                    }
                    const url = `${BACKEND_BASE}/rest/submission/download/${sub.submissionRoundId}/${sub.id}`;
                    return (
                        <a href={url} target="_blank" rel="noreferrer" className={styles.downloadBtn}>
                            Download
                        </a>
                    );
                },
            });
        }

        if (isResults) {
            cols.push(
                {
                    id: "status",
                    header: "Status",
                    cell: ({ row }) => {
                        const sub = row.original;
                        const statusText = sub.status?.status ?? "Queued";
                        const className = getStatusClass(statusText);
                        if (sub.youtubeLink) {
                            return (
                                <a
                                    href={sub.youtubeLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`${className} ${styles.youtubeLink}`}
                                >
                                    {statusText}
                                </a>
                            );
                        }
                        return <span className={className}>{statusText}</span>;
                    },
                },
                {
                    id: "comments",
                    header: "Comments",
                    cell: ({ row }) => (
                        <span className={styles.normal}>{row.original.status?.additionalInfo ?? ""}</span>
                    ),
                },
            );
        }

        if (isAdmin || isResults) {
            cols.push({
                accessorKey: "recordedFormat",
                header: "Format",
            });
        }

        return cols;
    }, [isAdmin, isResults, isPreviousResults]);

    const table = useReactTable({
        data: filteredSubmissions,
        columns,
        state: {
            sorting,
            rowSelection,
        },
        onSortingChange: setSorting,
        onRowSelectionChange: updater => {
            const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
            setRowSelection(newSelection);
            if (onSelectionChange) {
                const selectedIds = Object.keys(newSelection)
                    .filter(k => newSelection[k])
                    .map(Number);
                onSelectionChange(selectedIds);
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableRowSelection: selectable,
        getRowId: row => String(row.id),
    });

    if (filteredSubmissions.length === 0) {
        return <div className={styles.emptyState}>No submissions</div>;
    }

    return (
        <div>
            {toolbar}
            <div className={styles.wrapper}>
                <table className={styles.table}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {selectable && <th style={{ width: 40 }} />}
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className={header.column.getCanSort() ? styles.sortable : undefined}
                                        onClick={header.column.getToggleSortingHandler()}
                                        style={{ width: header.getSize() }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted() === "asc" && (
                                            <i className={`bi bi-caret-up-fill ${styles.sortIcon}`} />
                                        )}
                                        {header.column.getIsSorted() === "desc" && (
                                            <i className={`bi bi-caret-down-fill ${styles.sortIcon}`} />
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                className={row.getIsSelected() ? styles.selectedRow : undefined}
                                onClick={selectable ? row.getToggleSelectedHandler() : undefined}
                                style={selectable ? { cursor: "pointer" } : undefined}
                            >
                                {selectable && (
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={row.getIsSelected()}
                                            onChange={row.getToggleSelectedHandler()}
                                        />
                                    </td>
                                )}
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
