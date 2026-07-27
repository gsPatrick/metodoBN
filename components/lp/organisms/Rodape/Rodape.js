import Wordmark from "@/components/lp/atoms/Wordmark/Wordmark";
import { NOME, CRN, AGENDAR_URL } from "@/components/lp/brand";
import styles from "./Rodape.module.css";

const NAV = [
  { label: "Início", href: "#topo" },
  { label: "O Método", href: "#metodo" },
  { label: "Sobre", href: "#sobre" },
  { label: "App", href: "#aplicativo" },
  { label: "Dúvidas", href: "#duvidas" },
];

function SetaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function Rodape() {
  return (
    <footer className={styles.rodape} data-lp-nav="onDark">
      <div className={styles.painel}>
        <div className={styles.inner}>
          <div className={styles.marca}>
            <Wordmark tone="onDark" size="xl" />
          </div>

          <h2 className={styles.titulo}>Agende sua consulta.</h2>

          {/* O nome dela vive dentro do link de agendamento, não como linha
              solta — é com uma pessoa que se marca a consulta. */}
          <p className={styles.apoio}>
            Presencial ou online, e a primeira conversa dura 90 minutos.{" "}
            <a className={styles.linkCta} href={AGENDAR_URL}>
              <span className={styles.linkTexto}>Agendar com {NOME}</span>
              <span className={styles.linkSeta} aria-hidden="true">
                <SetaIcon />
              </span>
            </a>
          </p>

          <div className={styles.barraNav}>
            <nav aria-label="Rodapé">
              <ul className={styles.navLista}>
                {NAV.map((l) => (
                  <li key={l.href}>
                    <a className={styles.navLink} href={l.href}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <a className={styles.botaoCheio} href={AGENDAR_URL}>
              Agendar
            </a>
          </div>
        </div>
      </div>

      {/* Faixa do vídeo com os créditos. O vídeo é fixo no pé da janela e fica
          atrás das seções (todas em z-index 2); quando esta faixa transparente
          chega, a cena aparece — o conteúdo desliza para fora dela. */}
      <div className={styles.faixa}>
        <video
          className={styles.video}
          src="/videos/hero-verdes.mp4"
          poster="/images/hero-verdes-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        />
        <span className={styles.veu} aria-hidden="true" />

        <div className={styles.barra}>
          <p className={styles.credito}>
            © {new Date().getFullYear()} {NOME} · {CRN}
          </p>
          <a
            className={styles.autor}
            href="https://codebypatrick.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Desenvolvido por <span className={styles.autorNome}>Patrick.Developer</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
