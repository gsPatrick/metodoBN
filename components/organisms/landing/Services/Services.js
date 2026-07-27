"use client";

import { useEffect, useRef } from "react";
import { initGsap } from "@/lib/registerGsap";
import Section from "@/components/atoms/landing/Section/Section";
import styles from "./Services.module.css";

const PLANS = [
  {
    title: "Consulta inicial",
    subtitle: "O ponto de partida",
    body: "Anamnese completa na plataforma, avaliação corporal e plano alimentar personalizado com metas para os primeiros 30 dias.",
    detail: "90 min · presencial ou online",
  },
  {
    title: "Acompanhamento",
    subtitle: "Evolução contínua",
    body: "Retornos com ajustes finos, chat em tempo real, hábitos gamificados e monitoramento de resultados pelo Método BN.",
    detail: "Plano trimestral",
  },
];

export default function Services() {
  const gridRef = useRef(null);

  useEffect(() => {
    let mm;
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll(`.${styles.card}`);

    initGsap().then((libs) => {
      if (!libs) return;
      const { gsap } = libs;

      mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(cards, {
          opacity: 0,
          y: 40,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      });
    });

    return () => mm?.revert();
  }, []);

  return (
    <Section id="planos" className={styles.sectionBg}>
      <div className={styles.header}>
        <p className={styles.label}>Planos</p>
        <h2 className={styles.title}>Dois caminhos, uma só prioridade: você</h2>
      </div>

      <div ref={gridRef} className={styles.grid}>
        {PLANS.map((plan) => (
          <article key={plan.title} className={styles.card}>
            <p className={styles.subtitle}>{plan.subtitle}</p>
            <h3 className={styles.cardTitle}>{plan.title}</h3>
            <p className={styles.body}>{plan.body}</p>
            <p className={styles.detail}>{plan.detail}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
