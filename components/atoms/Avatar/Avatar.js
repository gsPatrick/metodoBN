import styles from "./Avatar.module.css";

function initials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function Avatar({ src, name = "", size = "md", status = null }) {
  const className = [styles.avatar, styles[`size_${size}`]].join(" ");

  return (
    <span className={styles.root}>
      <span className={className} role="img" aria-label={name || "Avatar"}>
        {src ? (
          <img src={src} alt={name} className={styles.img} />
        ) : (
          <span className={styles.initials}>{initials(name) || "•"}</span>
        )}
      </span>
      {status && (
        <span
          className={`${styles.status} ${styles[`status_${status}`]}`}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
