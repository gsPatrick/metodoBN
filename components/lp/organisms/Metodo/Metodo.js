import styles from "./Metodo.module.css";

// As três etapas são o Método. Numerar aqui é honesto: é uma sequência real,
// não enfeite — a pessoa passa por elas nessa ordem.
const ETAPAS = [
  {
    n: "01",
    titulo: "A escuta",
    corpo:
      "Uma primeira consulta longa: anamnese completa, avaliação corporal e a sua rotina de verdade — o que você come, a que horas, e o que atrapalha. Sem julgamento.",
    detalhe: "90 minutos · presencial ou online",
  },
  {
    n: "02",
    titulo: "O plano",
    corpo:
      "Metas claras para os primeiros 30 dias, com receitas e substituições que cabem na sua vida. Se um alimento não faz sentido para você, ele não entra.",
    detalhe: "Feito sob medida",
  },
  {
    n: "03",
    titulo: "A presença",
    corpo:
      "O plano é revisto enquanto a vida acontece, não depois. Retornos com ajustes finos e contato aberto entre as consultas — porque é aí que a mudança acontece ou se perde.",
    detalhe: "Acompanhamento contínuo",
  },
];

// Seção bone (clara), em contraste com o hero escuro. O data-lp-nav avisa o
// Header para virar escuro aqui.
export default function Metodo() {
  return (
    <section id="metodo" className={styles.secao} data-lp-nav="onLight">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>O Método BN</p>
          <h2 className={styles.titulo}>
            Nutrição não é sobre restrição.
            <span className={styles.destaque}>
              É entender o que o seu corpo precisa para florescer.
            </span>
          </h2>
          <p className={styles.texto}>
            O Método BN é o jeito da Beatriz de trabalhar. Em vez de entregar uma dieta e marcar o
            retorno para dali a um mês, ele parte de uma escuta longa, vira um plano que cabe na sua
            rotina e continua presente enquanto você vive essa rotina.
          </p>
        </div>

        <ol className={styles.etapas}>
          {ETAPAS.map((e) => (
            <li key={e.n} className={styles.etapa}>
              <span className={styles.numero}>{e.n}</span>
              <div className={styles.conteudo}>
                <h3 className={styles.etapaTitulo}>{e.titulo}</h3>
                <p className={styles.etapaCorpo}>{e.corpo}</p>
              </div>
              <span className={styles.detalhe}>{e.detalhe}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
