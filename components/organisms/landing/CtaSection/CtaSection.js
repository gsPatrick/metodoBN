"use client";

import { useEffect, useRef } from "react";
import { initGsap } from "@/lib/registerGsap";
import Button from "@/components/atoms/landing/Button/Button";
import styles from "./CtaSection.module.css";

export default function CtaSection() {
  const cardRef = useRef(null);

  useEffect(() => {
    let mm;
    const card = cardRef.current;
    if (!card) return;

    initGsap().then((libs) => {
      if (!libs) return;
      const { gsap } = libs;

      mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(card, {
          opacity: 0,
          y: 36,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });
      });
    });

    return () => mm?.revert();
  }, []);

  return (
    <section id="agendar" className={styles.section}>
      <div className={styles.wrap}>
        <div ref={cardRef} className={styles.card}>
          <p className={styles.eyebrow}>Próximo passo</p>
          <h2 className={styles.title}>
            Sua primeira consulta começa com uma conversa
          </h2>
          <p className={styles.body}>
            Fale com a Beatriz Nascimento para agendar um horário. Presencial ou
            online — com acompanhamento digital pelo Método BN entre as consultas.
          </p>
          <Button label="Falar com a Beatriz" href="#agendar" variant="outline" />
        </div>
      </div>
    </section>
  );
}
