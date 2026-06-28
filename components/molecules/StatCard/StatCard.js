import Card from "@/components/atoms/Card/Card";
import styles from "./StatCard.module.css";

function TrendIcon({ direction }) {
  if (direction === "down") {
    return (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M3 6l5 5 5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 10l5-5 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StatCard({
  label,
  value,
  unit,
  icon,
  trend,
  trendDirection = "up",
  helper,
  accent = false,
  className = ""
}) {
  const trendClass = [
    styles.trend,
    trendDirection === "down" ? styles.trendDown : styles.trendUp
  ].join(" ");

  return (
    <Card
      elevation="md"
      padding="md"
      className={[styles.card, accent ? styles.accent : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {unit && <span className={styles.unit}>{unit}</span>}
        {trend && (
          <span className={trendClass}>
            <TrendIcon direction={trendDirection} />
            {trend}
          </span>
        )}
      </div>
      {helper && <span className={styles.helper}>{helper}</span>}
    </Card>
  );
}
