"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { initGsap } from "@/lib/registerGsap";
import Section from "@/components/atoms/landing/Section/Section";
import styles from "./Testimonial.module.css";

const HIGHLIGHTS = [
  { value: "3 meses", label: "de acompanhamento" },
  { value: "+energia", label: "no dia a dia" },
  { value: "0 culpa", label: "na relação com comida" },
];

export default function Testimonial() {
  const panelRef = useRef(null);

  useEffect(() => {
    let mm;
    const panel = panelRef.current;
    if (!panel) return;

    initGsap().then((libs) => {
      if (!libs) return;
      const { gsap } = libs;

      mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(panel, {
          opacity: 0,
          y: 36,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: panel,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });
      });
    });

    return () => mm?.revert();
  }, []);

  return (
    <Section id="depoimentos" className={styles.section}>
      <div ref={panelRef} className={styles.panel}>
        <div className={styles.quoteCol}>
          <p className={styles.label}>Depoimento</p>
          <span className={styles.mark} aria-hidden="true">
            “
          </span>
          <blockquote className={styles.quote}>
            Pela primeira vez entendi que nutrição podia ser gentil. Em três meses
            recuperei energia, sono e uma relação saudável com a comida — sem culpa,
            sem fórmulas mágicas.
          </blockquote>
        </div>

        <div className={styles.asideCol}>
          <div className={styles.imageFrame}>
            <Image
              src="/images/footer-botanical.jpg"
              alt=""
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 420px"
              aria-hidden="true"
            />
          </div>

          <footer className={styles.attribution}>
            <span className={styles.name}>Mariana Costa</span>
            <span className={styles.role}>Paciente Método BN</span>
          </footer>

          <ul className={styles.highlights}>
            {HIGHLIGHTS.map((item) => (
              <li key={item.value} className={styles.highlight}>
                <span className={styles.highlightValue}>{item.value}</span>
                <span className={styles.highlightLabel}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
