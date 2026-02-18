import { useEffect, useState } from "react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useStats } from "../../hooks";
import type { PublicStats } from "../../types";
import styles from "./StatsPanel.module.scss";

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatsPanelProps {
    roundId: number;
}

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "50%",
    plugins: {
        legend: {
            position: "bottom" as const,
            labels: {
                color: "#d4d4d4",
                font: {
                    family: "'Consolas', 'Monaco', monospace",
                    size: 11,
                },
                padding: 12,
            },
        },
        tooltip: {
            backgroundColor: "#1a1a1a",
            titleColor: "#ffffff",
            bodyColor: "#d4d4d4",
            borderColor: "#333333",
            borderWidth: 1,
            titleFont: {
                family: "'Share Tech Mono', monospace",
            },
            bodyFont: {
                family: "'Consolas', monospace",
            },
        },
    },
};

function buildChartData(data: Record<string, number>, colors: string[]) {
    const labels = Object.keys(data);
    const values = Object.values(data);

    return {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: colors.map(c => `${c}cc`),
                borderColor: colors,
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverOffset: 8,
            },
        ],
    };
}

export function StatsPanel({ roundId }: StatsPanelProps) {
    const { getStats } = useStats();
    const [stats, setStats] = useState<PublicStats | null>(null);

    useEffect(() => {
        async function load() {
            const data = await getStats(roundId);
            setStats(data);
        }
        load();
    }, [roundId, getStats]);

    return (
        <div className={styles.panel}>
            <div className={styles.header}>Active Round Stats</div>
            <div className={styles.body}>
                <div className={styles.grid}>
                    <div className={styles.chartWrapper}>
                        <div className={styles.chartTitle}>Recorded Format</div>
                        {stats?.recordFormat && Object.keys(stats.recordFormat).length > 0 ? (
                            <div className={styles.chartContainer}>
                                <Doughnut
                                    data={buildChartData(stats.recordFormat, ["#2ecc40", "#ff4136"])}
                                    options={chartOptions}
                                />
                            </div>
                        ) : (
                            <div className={styles.noData}>No data available</div>
                        )}
                    </div>
                    <div className={styles.chartWrapper}>
                        <div className={styles.chartTitle}>Map Author</div>
                        {stats?.isAuthor && Object.keys(stats.isAuthor).length > 0 ? (
                            <div className={styles.chartContainer}>
                                <Doughnut
                                    data={buildChartData(stats.isAuthor, ["#ff851b", "#39cccc"])}
                                    options={chartOptions}
                                />
                            </div>
                        ) : (
                            <div className={styles.noData}>No data available</div>
                        )}
                    </div>
                    <div className={styles.chartWrapper}>
                        <div className={styles.chartTitle}>Submission Distributable</div>
                        {stats?.distributable && Object.keys(stats.distributable).length > 0 ? (
                            <div className={styles.chartContainer}>
                                <Doughnut
                                    data={buildChartData(stats.distributable, ["#9b59b6", "#607d8b"])}
                                    options={chartOptions}
                                />
                            </div>
                        ) : (
                            <div className={styles.noData}>No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
