import { NOME, CRN } from "@/components/lp/brand";
import styles from "./Sobre.module.css";

// ⚠️ PROVISÓRIO: não existe retrato dela no projeto. Esta é a imagem
// atmosférica do acervo, só para a diagramação ficar de pé. Trocar pelo retrato
// — a seção "quem está por trás" perde muito sem o rosto da pessoa.
const RETRATO = "/images/cta-atmosphere.jpg";

const FATOS = [
  { rotulo: "Atendimento", valor: "Presencial · Online" },
  { rotulo: "Acompanhamento", valor: "Contínuo" },
];

export default function Sobre() {
  return (
    <section id="sobre" className={styles.secao} data-lp-nav="onDark">
      <div className={styles.inner}>
        <figure className={styles.retrato}>
          <img src={RETRATO} alt={`${NOME}, nutricionista clínica`} />
        </figure>

        <div className={styles.texto}>
          <p className={styles.eyebrow}>Nutricionista clínica</p>

          <h3 className={styles.nome}>{NOME}</h3>
          <p className={styles.crn}>{CRN}</p>

          <p className={styles.frase}>
            Cada pessoa carrega uma história única — e nutrição de verdade respeita essa história.
          </p>

          <p className={styles.corpo}>
            É por isso que o trabalho dela começa com escuta, e não com uma dieta pronta. Depois
            vem um plano realista, baseado em evidência, que é ajustado enquanto a sua rotina
            acontece — e não seis meses depois, quando já não faz mais sentido.
          </p>

          <dl className={styles.fatos}>
            {FATOS.map((f) => (
              <div key={f.rotulo} className={styles.fato}>
                <dt className={styles.fatoRotulo}>{f.rotulo}</dt>
                <dd className={styles.fatoValor}>{f.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
