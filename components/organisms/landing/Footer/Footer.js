import Link from "next/link";
import Logo from "@/components/atoms/Logo/Logo";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo size="md" showName />
          <div>
            <p className={styles.name}>Beatriz Nascimento</p>
            <p className={styles.crn}>Nutricionista · Método BN</p>
          </div>
        </div>

        <nav className={styles.links} aria-label="Rodapé">
          <a href="#sobre">Sobre</a>
          <a href="#planos">Planos</a>
          <a href="#depoimentos">Depoimentos</a>
          <Link href="/login">Acessar plataforma</Link>
        </nav>

        <p className={styles.copy}>
          © {new Date().getFullYear()} Método BN. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
