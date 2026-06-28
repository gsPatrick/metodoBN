"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Toast.module.css";

function ToastIcon({ variant }) {
  if (variant === "success") {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M6 10.5l2.5 2.5L14 7.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 5.5v5M10 14h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5M10 6h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Toast({
  variant = "info",
  title,
  description,
  duration = 4000,
  onDismiss,
  className = ""
}) {
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef(null);

  const dismiss = () => {
    setLeaving(true);
    window.setTimeout(() => {
      onDismiss && onDismiss();
    }, 220);
  };

  useEffect(() => {
    if (!duration) return undefined;
    timerRef.current = window.setTimeout(() => dismiss(), duration);
    return () => window.clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const pause = () => window.clearTimeout(timerRef.current);
  const resume = () => {
    if (!duration) return;
    timerRef.current = window.setTimeout(() => dismiss(), duration);
  };

  const classNames = [
    styles.toast,
    styles[`variant_${variant}`],
    leaving ? styles.leaving : styles.entering,
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <span className={styles.icon}>
        <ToastIcon variant={variant} />
      </span>
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={dismiss}
        aria-label="Fechar notificação"
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      {duration ? (
        <span
          className={styles.progress}
          style={{ animationDuration: `${duration}ms` }}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
