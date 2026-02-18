import type { ReactNode } from "react";
import { Link } from "react-router";
import styles from "./Layout.module.scss";

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <Link to="/">
                            <span>Vytaan</span> Submissions
                        </Link>
                        <div className={styles.subtitle}>Viewer Doom Map Submissions</div>
                    </div>
                </div>
            </header>
            <main className={styles.main}>{children}</main>
        </div>
    );
}
