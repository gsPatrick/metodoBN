import styles from "./Badge.module.css";

export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  ...rest
}) {
  const className = [styles.badge, styles[`variant_${variant}`], styles[`size_${size}`]]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className} {...rest}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
