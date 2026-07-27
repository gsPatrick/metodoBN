import styles from "./ArrowButton.module.css";

// CTA assinatura do Darkroom: pill escuro + círculo no acento.
// O círculo é a ÚNICA superfície de acento da página — só um por viewport.
//
// `as="button"` para submeter formulário; sem isso é âncora.
export default function ArrowButton({ label, href, as, className = "", ...rest }) {
  const Tag = as || (href ? "a" : "button");
  const extra = Tag === "button" ? { type: rest.type || "submit" } : { href };

  return (
    <Tag className={`${styles.button} ${className}`} {...extra} {...rest}>
      <span className={styles.label}>{label}</span>
      <span className={styles.icon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h13" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </Tag>
  );
}
