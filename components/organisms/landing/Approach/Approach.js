"use client";

import { useEffect, useRef } from "react";
import { initGsap } from "@/lib/registerGsap";
import Section from "@/components/atoms/landing/Section/Section";
import styles from "./Approach.module.css";

const STEPS = [
  {
    number: "01",
    title: "Consulta inicial",
    body: "Anamnese digital completa, avaliação corporal e entendimento da sua rotina real — sem julgamento, só escuta e ciência.",
    detail: "90 minutos",
  },
  {
    number: "02",
    title: "Plano personalizado",
    body: "Metas claras para os primeiros 30 dias, com receitas e substituições que cabem na sua vida — montado na plataforma.",
    detail: "Plano sob medida",
  },
  {
    number: "03",
    title: "Acompanhamento",
    body: "Chat, hábitos gamificados e retornos com ajustes finos para resultados sustentáveis entre consultório e rotina.",
    detail: "Método BN",
  },
];

export default function Approach() {
  const listRef = useRef(null);

  useEffect(() => {
    let mm;
    const list = listRef.current;
    if (!list) return;

    const items = list.querySelectorAll(`.${styles.step}`);

    initGsap().then((libs) => {
      if (!libs) return;
      const { gsap } = libs;

      mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(items, {
          opacity: 0,
          y: 32,
          stagger: 0.1,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: list,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      });
    });

    return () => mm?.revert();
  }, []);

  return (
    <Section id="como-funciona" className={styles.section}>
      <div className={styles.header}>
        <p className={styles.label}>Como funciona</p>
        <h2 className={styles.title}>
          Três encontros que mudam a forma como você se alimenta
        </h2>
      </div>

      <ol ref={listRef} className={styles.list}>
        {STEPS.map((step) => (
          <li key={step.number} className={styles.step}>
            <span className={styles.number}>{step.number}</span>
            <div className={styles.copy}>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
              <span className={styles.detail}>{step.detail}</span>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
