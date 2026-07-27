import styles from "./Button.module.css";

export default function Button({ label, href, variant = "primary", external }) {
  const className = `${styles.button} ${styles[variant]}`;

  if (href) {
    return (
      <a
        href={href}
        className={className}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <span>{label}</span>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </a>
    );
  }

  return (
    <button type="button" className={className}>
      <span>{label}</span>
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </button>
  );
}
