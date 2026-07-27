import WordReveal from "@/components/lp/atoms/WordReveal/WordReveal";
import styles from "./Pergunta.module.css";

/**
 * Seção de abertura: só uma pergunta, centralizada, em uma linha.
 * Serve de respiro e anuncia o bloco que vem logo abaixo.
 *
 * `tom` escolhe o fundo e, com ele, a cor de destaque: sage no claro, glow no
 * escuro — o verde da marca não tem contraste sobre o void.
 */
export default function Pergunta({ id, inicio, destaque, tom = "claro" }) {
  const escuro = tom === "escuro";

  // A frase fica em uma linha só, então o corpo tem que sair do comprimento
  // dela — senão uma pergunta mais longa estoura a coluna. As constantes vêm
  // da medida que coube em "O que é o Método BN?" (20 caracteres).
  const caracteres = `${inicio} ${destaque}`.length;
  const escala = {
    "--pergunta-vw": `${(128 / caracteres).toFixed(2)}vw`,
    "--pergunta-max": `${(124 / caracteres).toFixed(2)}rem`,
  };

  return (
    <section
      className={`${styles.secao} ${escuro ? styles.escuro : styles.claro}`}
      data-lp-nav={escuro ? "onDark" : "onLight"}
      aria-labelledby={id}
    >
      <div className={styles.inner}>
        <WordReveal
          as="h2"
          id={id}
          className={styles.pergunta}
          style={escala}
          segments={[{ text: inicio }, { text: destaque, className: styles.marca }]}
        />
      </div>
    </section>
  );
}
