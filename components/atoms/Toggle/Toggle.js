"use client";

import styles from "./Toggle.module.css";

export default function Toggle({ checked = false, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`${styles.toggle} ${checked ? styles.on : ""}`}
      onClick={() => onChange && onChange(!checked)}
    >
      <span className={styles.knob} />
    </button>
  );
}
