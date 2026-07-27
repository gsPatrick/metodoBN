import styles from "./Section.module.css";

export default function Section({ id, children, className = "", bleed = false }) {
  return (
    <section
      id={id}
      className={`${styles.section} ${bleed ? styles.bleed : ""} ${className}`}
    >
      <div className={styles.inner}>{children}</div>
    </section>
  );
}
