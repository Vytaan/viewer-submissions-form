import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ConfigProvider } from "./context/ConfigContext";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import { SocketProvider } from "./context/SocketContext";
import { ToastProvider } from "./components/Toast/Toast";
import { ConfirmProvider } from "./components/ConfirmDialog/ConfirmDialog";
import { App } from "./App";
import "./styles/global.scss";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <ConfigProvider>
                <AuthProvider>
                    <LoadingProvider>
                        <SocketProvider>
                            <ToastProvider>
                                <ConfirmProvider>
                                    <App />
                                </ConfirmProvider>
                            </ToastProvider>
                        </SocketProvider>
                    </LoadingProvider>
                </AuthProvider>
            </ConfigProvider>
        </BrowserRouter>
    </StrictMode>,
);
