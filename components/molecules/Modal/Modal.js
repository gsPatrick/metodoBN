"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  closeOnEsc = true
}) {
  const baseId = useId();
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && closeOnEsc) {
        e.stopPropagation();
        onClose && onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const node = dialogRef.current;
      if (!node) return;
      const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [closeOnEsc, onClose]
  );

  useEffect(() => {
    if (!open) return undefined;

    previousFocus.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const node = dialogRef.current;
      if (!node) return;
      const target = node.querySelector(FOCUSABLE) || node;
      target.focus();
    }, 20);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
      if (previousFocus.current && previousFocus.current.focus) {
        previousFocus.current.focus();
      }
    };
  }, [open]);

  if (!open || !mounted) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose && onClose();
    }
  };

  return createPortal(
    <div className={styles.overlay} onMouseDown={handleBackdrop}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${baseId}-title` : undefined}
        aria-describedby={description ? `${baseId}-desc` : undefined}
        className={`${styles.dialog} ${styles[`size_${size}`]}`}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {(title || onClose) && (
          <header className={styles.header}>
            <div className={styles.heading}>
              {title && (
                <h2 id={`${baseId}-title`} className={styles.title}>
                  {title}
                </h2>
              )}
              {description && (
                <p id={`${baseId}-desc`} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                className={styles.close}
                onClick={onClose}
                aria-label="Fechar"
              >
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </header>
        )}
        {children && <div className={styles.body}>{children}</div>}
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
