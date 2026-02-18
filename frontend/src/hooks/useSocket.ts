import { useEffect } from "react";
import { useSocketContext } from "../context/useSocketContext";

interface SocketSubmissionData {
    id: number;
    wadName: string;
    wadLevel: string;
}

export function useSocket(
    onNewSubmission?: (data: SocketSubmissionData) => void,
    onDeleteSubmission?: (ids: number[]) => void,
) {
    const { socket } = useSocketContext();

    useEffect(() => {
        if (!socket) {
            return;
        }

        if (onNewSubmission) {
            socket.on("newSubmission", onNewSubmission);
        }
        if (onDeleteSubmission) {
            socket.on("deleteSubmission", onDeleteSubmission);
        }

        return () => {
            if (onNewSubmission) {
                socket.off("newSubmission", onNewSubmission);
            }
            if (onDeleteSubmission) {
                socket.off("deleteSubmission", onDeleteSubmission);
            }
        };
    }, [socket, onNewSubmission, onDeleteSubmission]);
}
