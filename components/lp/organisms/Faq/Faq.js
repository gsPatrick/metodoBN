"use client";

import { useState } from "react";
import Acordeao from "@/components/lp/molecules/Acordeao/Acordeao";
import styles from "./Faq.module.css";

// Só perguntas que dá para responder com o que se sabe do trabalho dela.
// Preço ficou de fora de propósito — ver nota no README de components/lp.
const PERGUNTAS = [
  {
    p: "Como funciona a primeira consulta?",
    r: "Ela dura 90 minutos e é quase toda escuta. A Beatriz faz a anamnese completa, a avaliação corporal e entende a sua rotina de verdade: o que você come, a que horas, o que atrapalha e o que já tentou antes. Só depois disso nasce um plano.",
  },
  {
    p: "Vou precisar seguir uma dieta restritiva?",
    r: "Não. O plano parte do que você já come e da sua rotina, não de uma lista de proibições. Se um alimento não faz sentido para a sua vida, ele não entra — e substituições fazem parte do plano desde o começo.",
  },
  {
    p: "Dá para fazer tudo online?",
    r: "Sim. O atendimento é presencial ou online, e o acompanhamento entre as consultas acontece do mesmo jeito nos dois casos.",
  },
  {
    p: "E depois da consulta, como é o acompanhamento?",
    r: "Você sai com metas claras para os primeiros 30 dias, com receitas e substituições. Depois vêm os retornos com ajustes finos, e contato aberto no intervalo — o plano é revisto enquanto a sua rotina acontece, não meses depois.",
  },
  {
    p: "Em quanto tempo eu vejo resultado?",
    r: "Não existe um prazo que sirva para todo mundo: depende do seu ponto de partida, da sua rotina e do que vocês definirem como meta na primeira consulta. O que o Método propõe é ajuste contínuo, e não uma data no calendário.",
  },
];

export default function Faq() {
  // Um aberto por vez, e o primeiro já aberto — a seção não abre como um muro
  // de linhas fechadas.
  const [aberto, setAberto] = useState(0);

  return (
    <section id="duvidas" className={styles.secao} data-lp-nav="onLight">
      <div className={styles.inner}>
        <div className={styles.intro}>
          {/* O eyebrow carrega o contexto ("antes de marcar") para o título não
              repetir a palavra Dúvidas duas vezes seguidas. */}
          <p className={styles.eyebrow}>Antes de marcar</p>
          <h2 className={styles.titulo}>
            Dúvidas que você
            <span className={styles.destaque}>pode ter agora.</span>
          </h2>
        </div>

        <div className={styles.lista}>
          {PERGUNTAS.map((item, i) => (
            <Acordeao
              key={item.p}
              pergunta={item.p}
              resposta={item.r}
              aberto={aberto === i}
              onToggle={() => setAberto(aberto === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
