import styles from "./Skeleton.module.css";

// Bloco de carregamento com shimmer. width/height/radius aceitam qualquer unidade CSS.
export default function Skeleton({ width = "100%", height = 16, radius, circle = false, className = "" }) {
  const h = typeof height === "number" ? `${height}px` : height;
  const w = typeof width === "number" ? `${width}px` : width;
  const r = circle ? "50%" : radius || "var(--radius-sm)";
  return (
    <span
      className={`${styles.sk} ${className}`}
      style={{ "--sk-w": w, "--sk-h": h, "--sk-r": r }}
      aria-hidden="true"
    />
  );
}
