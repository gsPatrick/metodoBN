import styles from "./RadioGroup.module.css";

export default function RadioGroup({
  name,
  options = [],
  value,
  onChange,
  label,
  orientation = "vertical"
}) {
  return (
    <div
      className={`${styles.group} ${orientation === "horizontal" ? styles.horizontal : ""}`}
      role="radiogroup"
      aria-label={label}
    >
      {options.map((opt) => {
        const optValue = typeof opt === "object" ? opt.value : opt;
        const optLabel = typeof opt === "object" ? opt.label : opt;
        const optDisabled = typeof opt === "object" ? opt.disabled : false;
        const id = `${name}-${optValue}`;
        return (
          <label
            key={optValue}
            htmlFor={id}
            className={`${styles.option} ${optDisabled ? styles.disabled : ""}`}
          >
            <span className={styles.radioWrap}>
              <input
                id={id}
                type="radio"
                name={name}
                value={optValue}
                className={styles.input}
                checked={value === optValue}
                disabled={optDisabled}
                onChange={(e) => onChange && onChange(e.target.value)}
              />
              <span className={styles.dot} aria-hidden="true" />
            </span>
            <span className={styles.label}>{optLabel}</span>
          </label>
        );
      })}
    </div>
  );
}
