"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { initGsap } from "@/lib/registerGsap";
import Section from "@/components/atoms/landing/Section/Section";
import styles from "./Statement.module.css";

const TEXT =
  "Nutrição não é sobre restrição — é sobre entender o que o seu corpo precisa para florescer.";

const CREDENTIALS = [
  { label: "Método", value: "BN" },
  { label: "Acompanhamento", value: "Contínuo" },
  { label: "Atendimento", value: "Presencial · Online" },
];

export default function Statement() {
  const titleRef = useRef(null);
  const bodyRef = useRef(null);
  const visualRef = useRef(null);

  useEffect(() => {
    let mm;
    const title = titleRef.current;
    const body = bodyRef.current;
    const visual = visualRef.current;
    if (!title) return;

    const words = title.querySelectorAll(`.${styles.word}`);

    initGsap().then((libs) => {
      if (!libs) return;
      const { gsap } = libs;

      mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (visual) {
          gsap.from(visual, {
            opacity: 0,
            y: 28,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: visual,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          });
        }

        gsap.set(words, { opacity: 0.2, filter: "blur(6px)" });
        gsap.to(words, {
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.06,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: title,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        });

        if (body) {
          gsap.from(body, {
            opacity: 0,
            y: 24,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: body,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(words, { opacity: 1, filter: "none" });
      });
    });

    return () => mm?.revert();
  }, []);

  return (
    <Section id="sobre" className={styles.section}>
      <div className={styles.grid}>
        <div ref={visualRef} className={styles.visual}>
          <div className={styles.imageFrame}>
            <Image
              src="/images/cta-atmosphere.jpg"
              alt="Ambiente de consulta com luz natural"
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, 380px"
            />
          </div>
          <ul className={styles.credentials}>
            {CREDENTIALS.map((item) => (
              <li key={item.label} className={styles.credential}>
                <span className={styles.credentialLabel}>{item.label}</span>
                <span className={styles.credentialValue}>{item.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.content}>
          <p className={styles.label}>Sobre</p>
          <h2 ref={titleRef} className={styles.title}>
            {TEXT.split(" ").map((word, i) => (
              <span key={`${word}-${i}`} className={styles.word}>
                {word}
                {i < TEXT.split(" ").length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </h2>
          <div ref={bodyRef} className={styles.body}>
            <p>
              A Nutricionista Beatriz Nascimento acredita que cada pessoa carrega
              uma história única — e que nutrição de verdade respeita essa história.
            </p>
            <p>
              O trabalho começa com escuta. Depois vem um plano realista, baseado em
              evidência, com acompanhamento digital pelo Método BN entre uma consulta e outra.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
