import styles from "./Logo.module.css";

/* Marca do app (definitiva): wordmark de texto "Método: BN".
   "Método" em branco + ":BN" em verde (gradiente). Minimalista, tom verde/preto.
   Para renomear no futuro, basta editar aqui (ou passar via props). */
export const BRAND = {
  name: "Método",
  mark: "BN",
  separator: ":"
};

export default function Logo({
  name = BRAND.name,
  mark = BRAND.mark,
  separator = BRAND.separator,
  showName = true,
  size = "md",
  className = ""
}) {
  const fullName = `${name}${separator} ${mark}`;
  const cls = [styles.logo, styles[`size_${size}`], showName ? "" : styles.compact, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls} aria-label={fullName}>
      {showName && (
        <>
          <span className={styles.word}>{name}</span>
          <span className={styles.sep} aria-hidden="true">
            {separator}
          </span>
        </>
      )}
      <span className={styles.mark}>{mark}</span>
    </span>
  );
}
