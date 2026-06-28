"use client";

import { useId } from "react";
import styles from "./SearchInput.module.css";

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M13.5 13.5L17 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SearchInput({
  value = "",
  onChange,
  onClear,
  placeholder = "Buscar...",
  size = "md",
  disabled = false,
  className = "",
  ...rest
}) {
  const id = useId();
  const classNames = [styles.wrap, styles[`size_${size}`], className]
    .filter(Boolean)
    .join(" ");

  const handleChange = (e) => {
    onChange && onChange(e.target.value);
  };

  const handleClear = () => {
    if (onClear) onClear();
    else onChange && onChange("");
  };

  return (
    <div className={classNames}>
      <span className={styles.searchIcon} aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        id={id}
        type="search"
        role="searchbox"
        className={styles.input}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
      />
      {value && !disabled && (
        <button
          type="button"
          className={styles.clear}
          onClick={handleClear}
          aria-label="Limpar busca"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
