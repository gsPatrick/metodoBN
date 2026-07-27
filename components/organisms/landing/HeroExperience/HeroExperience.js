"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { initGsap } from "@/lib/registerGsap";
import Button from "@/components/atoms/landing/Button/Button";
import styles from "./HeroExperience.module.css";

export default function HeroExperience() {
  const canvasRef = useRef(null);
  const headingRef = useRef(null);
  const bottomRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let intro;
    const canvas = canvasRef.current;
    const heading = headingRef.current;
    const bottom = bottomRef.current;
    if (!canvas) return;

    initGsap().then((libs) => {
      if (!libs) return;
      const { gsap } = libs;

      intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .fromTo(canvas, { scale: 1.04, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4 })
        .fromTo(heading, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 }, "-=0.6")
        .fromTo(bottom, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");
    });

    return () => intro?.kill();
  }, []);

  useEffect(() => {
    const onScroll = () => setExpanded(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className={styles.experience} id="top">
      <div className={styles.videoBg}>
        <div className={`${styles.frame} ${expanded ? styles.expanded : ""}`}>
          <div ref={canvasRef} className={styles.canvas}>
            <Image
              src="/login.jpg"
              alt="Nutricionista Beatriz Nascimento"
              fill
              priority
              className={styles.image}
              sizes="100vw"
            />
            <div className={styles.overlay} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.inner}>
          <h1 ref={headingRef} className={styles.heading}>
            Pequenas escolhas, grandes transformações
          </h1>
          <div ref={bottomRef} className={styles.bottom}>
            <p className={styles.lead}>
              Nutrição clínica com acompanhamento contínuo — Beatriz Nascimento
              e o Método BN, sem dietas restritivas.
            </p>
            <Button label="Agendar consulta" href="#agendar" variant="outline" />
          </div>
        </div>
      </div>
    </section>
  );
}
