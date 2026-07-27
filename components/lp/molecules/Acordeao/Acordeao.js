"use client";

import { useId } from "react";
import styles from "./Acordeao.module.css";

/**
 * Item de acordeão controlado pelo pai (só um aberto por vez).
 *
 * Botão + região com aria-expanded/aria-controls em vez de <details>: assim a
 * abertura pode ser animada de verdade (grid-template-rows de 0fr para 1fr),
 * que o <details> não permite por alternar display.
 */
export default function Acordeao({ pergunta, resposta, aberto, onToggle }) {
  const id = useId();
  const idResposta = `${id}-resposta`;
  const idBotao = `${id}-botao`;

  return (
    <div className={`${styles.item} ${aberto ? styles.abertoItem : ""}`}>
      <h3 className={styles.cabecalho}>
        <button
          type="button"
          id={idBotao}
          className={styles.botao}
          aria-expanded={aberto}
          aria-controls={idResposta}
          onClick={onToggle}
        >
          <span className={styles.pergunta}>{pergunta}</span>
          <span className={styles.sinal} aria-hidden="true">
            <span className={styles.traco} />
            <span className={`${styles.traco} ${styles.tracoVertical}`} />
          </span>
        </button>
      </h3>

      <div
        id={idResposta}
        role="region"
        aria-labelledby={idBotao}
        className={styles.painel}
        // inert quando fechado: tira o texto do foco e do leitor de tela.
        inert={aberto ? undefined : ""}
      >
        <div className={styles.painelInterno}>
          <p className={styles.resposta}>{resposta}</p>
        </div>
      </div>
    </div>
  );
}
