import styles from "./Logo.module.css";

export const BRAND = {
  name: "Método BN",
  src: "/publico.png"
};

export default function Logo({
  src = BRAND.src,
  alt = BRAND.name,
  size = "md",
  className = ""
}) {
  const cls = [styles.logo, styles[`size_${size}`], className].filter(Boolean).join(" ");

  return (
    <span className={cls}>
      <img className={styles.image} src={src} alt={alt} width={SIZE_PX[size]} height={SIZE_PX[size]} />
    </span>
  );
}

const SIZE_PX = {
  sm: 32,
  md: 44,
  lg: 64,
  xl: 84
};
