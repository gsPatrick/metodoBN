import ArrowButton from "@/components/lp/atoms/ArrowButton/ArrowButton";
import { NOME, CRN, AGENDAR_URL, WHATSAPP_URL } from "@/components/lp/brand";
import styles from "./Contato.module.css";

/**
 * Banner de CTA — o "atmospheric promo card" do arquétipo: copy no topo à
 * esquerda, ações no pé à esquerda e o cartão frosted no canto inferior direito.
 * A ação fica no fim do caminho de leitura, não no meio dele.
 *
 * A seção usa o mesmo bone da seção do Método, para o card flutuar sobre ela.
 */
export default function Contato() {
  return (
    <section id="contato" className={styles.secao} data-lp-nav="onLight">
      <div className={styles.inner}>
        <div className={styles.card}>
          <span className={styles.scrim} aria-hidden="true" />

          <div className={styles.conteudo}>
            <h2 className={styles.titulo}>Comece pela sua história, não por uma dieta.</h2>

            <p className={styles.texto}>
              A primeira consulta dura 90 minutos e serve para entender a sua rotina de verdade.
              Presencial ou online.
            </p>

            <div className={styles.acoes}>
              <ArrowButton label="Agendar consulta" href={AGENDAR_URL} />
              <a className={styles.secundario} href={WHATSAPP_URL}>
                Falar no WhatsApp
              </a>
            </div>
          </div>

          {/* Equivalente ao mockup de notificação da referência: cartão frosted
              assinando a credencial, em vez de simular um produto. */}
          <div className={styles.selo}>
            <span className={styles.seloNome}>{NOME}</span>
            <span className={styles.seloCrn}>{CRN}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
