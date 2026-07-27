import WordReveal from "@/components/lp/atoms/WordReveal/WordReveal";
import styles from "./Frase.module.css";

/**
 * Seção-ponte: uma frase centralizada que se revela palavra a palavra e um
 * traço que desce puxando o olho para a seção seguinte.
 *
 * `tom` escolhe o fundo e, com ele, a cor de destaque: sage no claro, glow no
 * escuro — o verde da marca não tem contraste sobre o void.
 */
export default function Frase({ id, inicio, destaque, tom = "claro" }) {
  const escuro = tom === "escuro";

  return (
    <section
      className={`${styles.secao} ${escuro ? styles.escuro : styles.claro}`}
      data-lp-nav={escuro ? "onDark" : "onLight"}
      aria-labelledby={id}
    >
      <div className={styles.inner}>
        <WordReveal
          as="p"
          id={id}
          className={styles.frase}
          segments={[{ text: inicio }, { text: destaque, className: styles.marca }]}
          stagger={80}
        />

        {/* O traço cresce quando a seção entra na tela — é ele que faz a
            passagem para a seção de baixo em vez de um corte seco. */}
        <span className={styles.traco} aria-hidden="true" />
      </div>
    </section>
  );
}
