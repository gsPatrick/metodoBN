import styles from "./Checkbox.module.css";

export default function Checkbox({ label, description, disabled = false, id, ...rest }) {
  return (
    <label className={`${styles.root} ${disabled ? styles.disabled : ""}`} htmlFor={id}>
      <span className={styles.boxWrap}>
        <input
          id={id}
          type="checkbox"
          className={styles.input}
          disabled={disabled}
          {...rest}
        />
        <span className={styles.box} aria-hidden="true">
          <svg viewBox="0 0 16 16" className={styles.check} fill="none">
            <path
              d="M3.5 8.5l3 3 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      {(label || description) && (
        <span className={styles.text}>
          {label && <span className={styles.label}>{label}</span>}
          {description && <span className={styles.description}>{description}</span>}
        </span>
      )}
    </label>
  );
}
