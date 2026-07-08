import styles from "./Divider.module.css";

export default function Divider({
  orientation = "horizontal",
  label,
  className = "",
  ...rest
}) {
  const classNames = [
    styles.divider,
    styles[`orientation_${orientation}`],
    label ? styles.withLabel : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  if (label && orientation === "horizontal") {
    return (
      <div className={classNames} role="separator" aria-orientation="horizontal" {...rest}>
        <span className={styles.line} aria-hidden="true" />
        <span className={styles.label}>{label}</span>
        <span className={styles.line} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={classNames}
      role="separator"
      aria-orientation={orientation}
      {...rest}
    />
  );
}
