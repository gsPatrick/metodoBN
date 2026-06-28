import styles from "./Spinner.module.css";

export default function Spinner({ size = "md", tone = "current", label = "Carregando" }) {
  const className = [styles.spinner, styles[`size_${size}`], styles[`tone_${tone}`]]
    .filter(Boolean)
    .join(" ");

  return <span className={className} role="status" aria-label={label} />;
}
