import { useCallback } from "react";
import * as authApi from "../utils/api/authApi";
import { useAuthContext } from "../context/useAuthContext";
import { useNavigate } from "react-router";

export function useAuth() {
    const { setIsAuthenticated } = useAuthContext();
    const navigate = useNavigate();

    const login = useCallback(
        async (email: string, password: string, captchaKey?: string, captchaResponse?: string) => {
            await authApi.login(email, password, captchaKey, captchaResponse);
            setIsAuthenticated(true);
            navigate("/admin");
        },
        [setIsAuthenticated, navigate],
    );

    const logout = useCallback(async () => {
        await authApi.logout();
        setIsAuthenticated(false);
        navigate("/");
    }, [setIsAuthenticated, navigate]);

    const checkAuth = useCallback(async () => {
        const authenticated = await authApi.checkAuth();
        setIsAuthenticated(authenticated);
        return authenticated;
    }, [setIsAuthenticated]);

    const changeDetails = useCallback(async (email: string, password: string) => {
        return authApi.changeDetails(email, password);
    }, []);

    return { login, logout, checkAuth, changeDetails };
}
