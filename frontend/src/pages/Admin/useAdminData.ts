import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../../context/useAuthContext";
import { useAuth, useRounds, useSocket } from "../../hooks";
import type { SubmissionRound } from "../../types";

export interface AdminStats {
    mostWad: string;
    mostPct: number;
    authorCount: number;
}

export function useAdminData() {
    const { isAuthenticated } = useAuthContext();
    const { checkAuth } = useAuth();
    const { getCurrentActiveRoundAdmin, getAllRounds } = useRounds();
    const navigate = useNavigate();

    const [activeRound, setActiveRound] = useState<SubmissionRound | null>(null);
    const [previousRounds, setPreviousRounds] = useState<SubmissionRound[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated === null) {
            checkAuth();
            return;
        }
        if (!isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, checkAuth, navigate]);

    const loadData = useCallback(async () => {
        try {
            const round = await getCurrentActiveRoundAdmin();
            setActiveRound(round);
            const rounds = await getAllRounds(false);
            setPreviousRounds(rounds);
        } catch {
        } finally {
            setLoading(false);
        }
    }, [getCurrentActiveRoundAdmin, getAllRounds]);

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated, loadData]);

    const reload = useCallback(() => {
        setLoading(true);
        loadData();
    }, [loadData]);

    const handleNewSubmission = useCallback(() => {
        reload();
    }, [reload]);

    const handleDeleteSubmission = useCallback(() => {
        reload();
    }, [reload]);

    useSocket(handleNewSubmission, handleDeleteSubmission);

    const verifiedSubmissions = useMemo(() => {
        return activeRound?.submissions.filter(s => s.verified && s.submissionValid) ?? [];
    }, [activeRound]);

    const unverifiedSubmissions = useMemo(() => {
        return activeRound?.submissions.filter(s => s.submissionValid && !s.verified) ?? [];
    }, [activeRound]);

    const stats = useMemo((): AdminStats | null => {
        if (!activeRound || verifiedSubmissions.length === 0) {
            return null;
        }
        const subs = verifiedSubmissions;
        const wadCounts: Record<string, number> = {};
        for (let i = 0; i < subs.length; i++) {
            const name = subs[i].wadName;
            wadCounts[name] = (wadCounts[name] ?? 0) + 1;
        }
        let mostWad = "";
        let mostCount = 0;
        for (const [name, count] of Object.entries(wadCounts)) {
            if (count > mostCount) {
                mostWad = name;
                mostCount = count;
            }
        }
        const authorCount = subs.filter(s => s.submitterAuthor).length;
        return { mostWad, mostPct: Math.round((mostCount / subs.length) * 100), authorCount };
    }, [activeRound, verifiedSubmissions]);

    return {
        isAuthenticated,
        activeRound,
        previousRounds,
        loading,
        reload,
        verifiedSubmissions,
        unverifiedSubmissions,
        stats,
    };
}
