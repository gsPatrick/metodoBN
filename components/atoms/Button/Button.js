import Spinner from "@/components/atoms/Spinner/Spinner";
import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  type = "button",
  ...rest
}) {
  const className = [
    styles.button,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth ? styles.fullWidth : "",
    loading ? styles.loading : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span className={styles.spinner}>
          <Spinner size="sm" />
        </span>
      )}
      <span className={styles.content}>
        {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
        {children && <span className={styles.label}>{children}</span>}
        {iconRight && <span className={styles.icon}>{iconRight}</span>}
      </span>
    </button>
  );
}
