"use client";

import { useState } from "react";
import styles from "./Input.module.css";

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
      <path d="M9.9 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.3 4.2" />
      <path d="M6.6 6.6A17.6 17.6 0 0 0 2 12s3.6 7 10 7a10.4 10.4 0 0 0 3-.4" />
    </svg>
  );
}

export default function Input({
  size = "md",
  invalid = false,
  warn = false,
  iconLeft = null,
  iconRight = null,
  className = "",
  type = "text",
  ...rest
}) {
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);
  const effectiveType = isPassword && revealed ? "text" : type;

  const wrapClass = [
    styles.wrap,
    styles[`size_${size}`],
    invalid ? styles.invalid : "",
    warn ? styles.warn : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={wrapClass}>
      {iconLeft && <span className={`${styles.icon} ${styles.iconLeft}`}>{iconLeft}</span>}
      <input
        type={effectiveType}
        className={styles.input}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {isPassword && !iconRight ? (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={revealed}
          tabIndex={-1}
        >
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      ) : (
        iconRight && <span className={`${styles.icon} ${styles.iconRight}`}>{iconRight}</span>
      )}
    </span>
  );
}
