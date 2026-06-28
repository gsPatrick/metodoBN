import styles from "./Switch.module.css";

export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  hideLabel = false,
  size = "md",
  id
}) {
  const handleClick = () => {
    if (!disabled && onChange) onChange(!checked);
  };

  const handleKey = (e) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange && onChange(!checked);
    }
  };

  return (
    <span className={`${styles.root} ${disabled ? styles.disabled : ""}`}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`${styles.track} ${styles[`size_${size}`]} ${checked ? styles.on : ""}`}
        onClick={handleClick}
        onKeyDown={handleKey}
      >
        <span className={styles.thumb} aria-hidden="true" />
      </button>
      {label && !hideLabel && (
        <span className={styles.label} onClick={handleClick}>
          {label}
        </span>
      )}
    </span>
  );
}
