import styles from "./Wordmark.module.css";

// Marca da landing: monograma + "Método: BN".
// Atom próprio da LP (e não o Logo do app) porque aqui a cor precisa responder
// ao fundo da seção — claro sobre foto, escuro sobre parchment.
export default function Wordmark({ tone = "onLight", size = "md", className = "" }) {
  const cls = [styles.mark, styles[tone], styles[`size_${size}`], className].filter(Boolean).join(" ");

  return (
    <span className={cls} aria-label="Método BN">
      <img className={styles.icon} src="/publico.png" alt="" width={40} height={40} />
      <span className={styles.word}>
        Método<span className={styles.colon}>:</span>
        <span className={styles.bn}>BN</span>
      </span>
    </span>
  );
}
