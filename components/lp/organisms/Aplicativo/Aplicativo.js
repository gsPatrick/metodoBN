import styles from "./Aplicativo.module.css";

// Telas REAIS do app, capturadas das rotas /app, /app/refeicoes e /app/chat
// rodando em viewport de celular — não são mockups desenhados.
// Se a interface mudar, recapturar em vez de redesenhar.
const TELAS = [
  {
    src: "/images/tela-app.png",
    legenda: "Início",
    descricao: "O dia em uma tela: hábitos, plano e o que falta registrar.",
    alt: "Tela inicial do app, com pontuação do dia, hábitos e atalho para o plano",
  },
  {
    src: "/images/tela-refeicoes.png",
    legenda: "Refeições",
    descricao: "Marque o que comeu e troque itens sem sair do plano.",
    alt: "Tela de refeições do app, com os alimentos de cada horário e o botão de trocas",
  },
  {
    src: "/images/tela-chat.png",
    legenda: "Conversa",
    descricao: "Dúvida no meio da semana não espera o próximo retorno.",
    alt: "Tela de conversa do app, com mensagens entre a paciente e a nutricionista",
  },
];

export default function Aplicativo() {
  return (
    <section id="aplicativo" className={styles.secao} data-lp-nav="onLight">
      <div className={styles.inner}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Incluso no acompanhamento</p>
          <h2 className={styles.titulo}>
            Depois da primeira consulta,
            <span className={styles.destaque}>o plano vai com você.</span>
          </h2>
          <p className={styles.texto}>
            O acesso ao app do Método BN é liberado assim que o seu plano fica pronto. Ele não
            substitui a consulta — evita que o plano fique esquecido num PDF até o próximo retorno.
          </p>
        </header>

        <ul className={styles.telas}>
          <span className={styles.brilho} aria-hidden="true" />
          {TELAS.map((t, i) => (
            <li key={t.src} className={`${styles.item} ${i === 1 ? styles.itemCentral : ""}`}>
              <figure className={styles.tela}>
                <img src={t.src} alt={t.alt} loading="lazy" />
              </figure>
              <p className={styles.legenda}>{t.legenda}</p>
              <p className={styles.descricao}>{t.descricao}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
