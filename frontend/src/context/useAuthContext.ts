import { createContext, useContext } from "react";

export interface AuthContextType {
    isAuthenticated: boolean | null;
    setIsAuthenticated: (value: boolean | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within AuthProvider");
    }
    return context;
}
