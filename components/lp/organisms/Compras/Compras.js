import styles from "./Compras.module.css";

// Tela REAL do app (/app/compras na fase de checklist) — não é mockup.
const TELA = "/images/tela-compras.png";

const PONTOS = [
  {
    titulo: "A lista sai do seu plano",
    corpo: "Nada de anotar à mão: os itens vêm dos alimentos que a Beatriz montou para a sua semana.",
  },
  {
    titulo: "Agrupada por seção do mercado",
    corpo: "Cereais, proteínas, frutas. Você percorre o corredor uma vez, não três.",
  },
  {
    titulo: "Você marca e ela risca",
    corpo: "O que já entrou no carrinho sai da frente, e o contador mostra quanto falta.",
  },
];

export default function Compras() {
  return (
    <section id="compras" className={styles.secao} data-lp-nav="onLight">
      <div className={styles.inner}>
        <figure className={styles.telaWrap}>
          <span className={styles.brilho} aria-hidden="true" />
          <span className={styles.tela}>
            <img
              src={TELA}
              alt="Tela de lista de compras do app, com 5 de 11 itens no carrinho, agrupados por seção do mercado"
              loading="lazy"
            />
          </span>
        </figure>

        <div className={styles.texto}>
          <p className={styles.eyebrow}>Modo compra</p>

          {/* Sem repetir "caderninho": a frase-ponte logo acima já usa a palavra. */}
          <h2 className={styles.titulo}>
            A lista pronta,
            <span className={styles.destaque}>no corredor do mercado.</span>
          </h2>

          <p className={styles.lead}>
            A lista de compras da semana já está pronta no app, montada a partir do seu plano. É só
            abrir no corredor do mercado e ir marcando.
          </p>

          <dl className={styles.pontos}>
            {PONTOS.map((p) => (
              <div key={p.titulo} className={styles.ponto}>
                <dt className={styles.pontoTitulo}>{p.titulo}</dt>
                <dd className={styles.pontoCorpo}>{p.corpo}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
