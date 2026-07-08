import styles from "./Logo.module.css";

export const BRAND = {
  name: "Método BN",
  word: "Método",
  mark: "BN",
  separator: ":",
  src: "/publico.png"
};

export default function Logo({
  src = BRAND.src,
  alt = BRAND.name,
  name = BRAND.word,
  mark = BRAND.mark,
  separator = BRAND.separator,
  showName = false,
  size = "md",
  className = ""
}) {
  const iconSize = SIZE_PX[size];
  const cls = [styles.logo, showName ? styles.withName : styles.iconOnly, styles[`size_${size}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls} aria-label={BRAND.name}>
      <img className={styles.image} src={src} alt={alt} width={iconSize} height={iconSize} />
      {showName && (
        <span className={styles.wordmark}>
          <span className={styles.word}>{name}</span>
          <span className={styles.sep} aria-hidden="true">
            {separator}
          </span>
          <span className={styles.mark}>{mark}</span>
        </span>
      )}
    </span>
  );
}

const SIZE_PX = {
  sm: 45,
  md: 62,
  lg: 90,
  xl: 118,
  hero: 126
};
