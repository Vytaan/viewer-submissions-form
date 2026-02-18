import { useLoadingContext } from "../../context/useLoadingContext";
import styles from "./LoadingOverlay.module.scss";

export function LoadingOverlay() {
    const { isLoading } = useLoadingContext();

    if (!isLoading) {
        return null;
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.spinner} />
        </div>
    );
}
