"use client";

import { useId, useRef, useState } from "react";
import styles from "./Tabs.module.css";

export default function Tabs({
  items = [],
  defaultValue,
  value,
  onChange,
  variant = "line",
  className = ""
}) {
  const baseId = useId();
  const tabRefs = useRef([]);
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(
    defaultValue ?? items[0]?.value
  );
  const active = isControlled ? value : internal;

  const select = (next) => {
    if (!isControlled) setInternal(next);
    onChange && onChange(next);
  };

  const onKeyDown = (e, index) => {
    const enabled = items
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => !it.disabled);
    const pos = enabled.findIndex(({ i }) => i === index);
    let nextPos = null;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") nextPos = (pos + 1) % enabled.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      nextPos = (pos - 1 + enabled.length) % enabled.length;
    if (e.key === "Home") nextPos = 0;
    if (e.key === "End") nextPos = enabled.length - 1;

    if (nextPos !== null) {
      e.preventDefault();
      const target = enabled[nextPos].i;
      tabRefs.current[target]?.focus();
      select(items[target].value);
    }
  };

  const activeItem = items.find((it) => it.value === active);

  const classNames = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={classNames}>
      <div
        role="tablist"
        className={`${styles.list} ${styles[`variant_${variant}`]}`}
      >
        {items.map((item, index) => {
          const selected = item.value === active;
          return (
            <button
              key={item.value}
              ref={(el) => (tabRefs.current[index] = el)}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.value}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              className={`${styles.tab} ${selected ? styles.active : ""}`}
              onClick={() => !item.disabled && select(item.value)}
              onKeyDown={(e) => onKeyDown(e, index)}
            >
              {item.icon && <span className={styles.tabIcon}>{item.icon}</span>}
              {item.label}
              {item.badge !== undefined && (
                <span className={styles.badge}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>
      {activeItem?.content !== undefined && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${active}`}
          aria-labelledby={`${baseId}-tab-${active}`}
          className={styles.panel}
          tabIndex={0}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
