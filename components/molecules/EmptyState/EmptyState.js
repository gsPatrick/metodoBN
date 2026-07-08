import styles from "./EmptyState.module.css";
import Icon from "@/components/atoms/Icon/Icon";
import Fruit from "@/components/atoms/Fruit/Fruit";

// Estado vazio reutilizável: arte (fruta ou ícone) + título + mensagem + ação opcional.
// variant: "default" | "error" — muda a cor da arte.
export default function EmptyState({ icon = "leaf", fruit, title, message, action, variant = "default", compact = false }) {
  return (
    <div className={`${styles.empty} ${compact ? styles.compact : ""}`}>
      <span className={`${styles.art} ${variant === "error" ? styles.artError : ""}`}>
        {fruit ? <Fruit name={fruit} fallback="apple" size={compact ? 44 : 56} /> : <Icon name={icon} size={compact ? 24 : 30} />}
      </span>
      {title && <span className={styles.title}>{title}</span>}
      {message && <span className={styles.message}>{message}</span>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
