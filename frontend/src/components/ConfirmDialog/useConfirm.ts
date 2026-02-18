import { createContext, useContext } from "react";

interface ConfirmOptions {
    title?: string;
    message: string;
}

export interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error("useConfirm must be used within ConfirmProvider");
    }
    return context.confirm;
}
