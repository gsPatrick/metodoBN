import styles from "./Select.module.css";

export default function Select({
  options = [],
  placeholder,
  invalid = false,
  size = "md",
  className = "",
  children,
  ...rest
}) {
  const wrapClass = [styles.wrap, styles[`size_${size}`], invalid ? styles.invalid : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={wrapClass}>
      <select className={styles.select} aria-invalid={invalid || undefined} {...rest}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const value = typeof opt === "object" ? opt.value : opt;
          const label = typeof opt === "object" ? opt.label : opt;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
        {children}
      </select>
      <span className={styles.chevron} aria-hidden="true">
        ▾
      </span>
    </span>
  );
}
