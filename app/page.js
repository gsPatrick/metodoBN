import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main} data-theme="dark">
      <div className={styles.panel}>
        <span className={styles.kicker}>Nutri Platform</span>
        <h1 className={styles.title}>
          Sistema de design <span className={styles.accent}>premium</span> para
          nutrição
        </h1>
        <p className={styles.subtitle}>
          A base atômica que sustenta a experiência de nutricionistas e
          pacientes. Componentes, tokens e padrões prontos para escalar.
        </p>
        <Link href="/design-system" className={styles.cta}>
          Ver design system
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </main>
  );
}
