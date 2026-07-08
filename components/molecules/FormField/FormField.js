import { useId } from "react";
import styles from "./FormField.module.css";

export default function FormField({
  label,
  htmlFor,
  children,
  helper,
  error,
  required = false,
  optional = false,
  hint,
  className = ""
}) {
  const generatedId = useId();
  const fieldId = htmlFor || generatedId;
  const describedById = `${fieldId}-desc`;
  const message = error || helper;

  const classNames = [styles.field, error ? styles.hasError : "", className]
    .filter(Boolean)
    .join(" ");

  const control =
    typeof children === "function"
      ? children({ id: fieldId, describedBy: message ? describedById : undefined })
      : children;

  return (
    <div className={classNames}>
      {label && (
        <div className={styles.labelRow}>
          <label htmlFor={fieldId} className={styles.label}>
            {label}
            {required && (
              <span className={styles.required} aria-hidden="true">
                *
              </span>
            )}
          </label>
          {optional && <span className={styles.optional}>opcional</span>}
          {hint && <span className={styles.hint}>{hint}</span>}
        </div>
      )}
      <div className={styles.control}>{control}</div>
      {message && (
        <p
          id={describedById}
          className={`${styles.message} ${error ? styles.error : ""}`}
          role={error ? "alert" : undefined}
        >
          {error && (
            <span className={styles.errorIcon} aria-hidden="true">
              !
            </span>
          )}
          {message}
        </p>
      )}
    </div>
  );
}
