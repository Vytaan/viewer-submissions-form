import { Link } from "react-router";
import styles from "./Error.module.scss";

export function ErrorPage() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.code}>404</div>
                <h1 className={styles.title}>Page Not Found</h1>
                <p className={styles.message}>The page you are looking for does not exist.</p>
                <Link to="/" className={styles.homeLink}>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
