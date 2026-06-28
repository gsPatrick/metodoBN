import styles from "./Textarea.module.css";

export default function Textarea({ invalid = false, rows = 4, className = "", ...rest }) {
  const classNames = [styles.textarea, invalid ? styles.invalid : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <textarea
      className={classNames}
      rows={rows}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}
