import { type ReactNode, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { SocketContext } from "./useSocketContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "";

const socket: Socket = io(`${SOCKET_URL}/submission`, {
    transports: ["websocket", "polling"],
});

export function SocketProvider({ children }: { children: ReactNode }) {
    const [connected, setConnected] = useState(() => socket.connected);

    useEffect(() => {
        if (!socket.connected && socket.disconnected) {
            socket.connect();
        }

        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);
        const onError = (err: Error) => console.error("[socket] connect_error:", err.message);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onError);
        };
    }, []);

    return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
}
