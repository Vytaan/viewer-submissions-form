import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

export interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
}

export const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export function useSocketContext() {
    return useContext(SocketContext);
}
