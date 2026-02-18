import { useCallback } from "react";
import { apiFetch, apiPost } from "../utils/api";
import type { WadValidationMapping } from "../types";

export function useWadValidation() {
    const getValidation = useCallback(async (): Promise<WadValidationMapping> => {
        return apiFetch<WadValidationMapping>("/utils/wadValidation");
    }, []);

    const setValidation = useCallback(async (mapping: WadValidationMapping) => {
        return apiPost("/utils/wadValidation", mapping);
    }, []);

    return { getValidation, setValidation };
}
