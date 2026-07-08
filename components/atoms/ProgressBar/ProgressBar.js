import styles from "./ProgressBar.module.css";

export default function ProgressBar({
  value = 0,
  max = 100,
  variant = "accent",
  size = "md",
  indeterminate = false,
  showValue = false,
  label,
  className = "",
  ...rest
}) {
  const safeMax = max <= 0 ? 100 : max;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);

  const classNames = [
    styles.root,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    indeterminate ? styles.indeterminate : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.wrap} {...rest}>
      {(label || showValue) && (
        <div className={styles.meta}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && !indeterminate && (
            <span className={styles.value}>{percent}%</span>
          )}
        </div>
      )}
      <div
        className={classNames}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-label={label}
      >
        <span
          className={styles.fill}
          style={indeterminate ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
