"use client";

import { useEffect, useState } from "react";
import ArrowButton from "@/components/lp/atoms/ArrowButton/ArrowButton";
import { CRN } from "@/components/lp/brand";
import styles from "./Hero.module.css";

// Visual do hero — trocar aqui troca a seção inteira.
// Loop de 24s gerado a partir da própria foto dela (deriva + zoom senoidais de
// mesmo período, então o vídeo fecha sem corte). Ver README de components/lp.
const HERO_VIDEO = "/videos/hero-verdes.mp4";
const HERO_POSTER = "/images/hero-verdes-poster.jpg";

/**
 * Hero do arquétipo Darkroom: o vídeo entra num frame arredondado com respiro
 * nas bordas e abre para full-bleed no primeiro scroll. O backdrop fica pinado
 * (sticky), então as próximas seções passam por cima dele sem recarregar nada.
 */
export default function Hero() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setExpanded(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="topo" className={styles.hero} data-lp-nav="onDark">
      <div className={styles.backdrop}>
        <div className={`${styles.frame} ${expanded ? styles.expanded : ""}`}>
          <div className={styles.canvas}>
            <video
              className={styles.video}
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
        </div>
      </div>

      <div className={styles.overlay}>
        <div className={styles.inner}>
          <div className={styles.top}>
            <p className={styles.eyebrow}>Nutricionista clínica</p>

            {/* O nome dela é o hero. A frase de marca vira apoio. */}
            <h1 className={styles.heading}>
              Beatriz
              <br />
              Nascimento
            </h1>

            {/* O CRN assina logo abaixo do nome, como numa placa profissional. */}
            <p className={styles.crn}>{CRN}</p>

            <p className={styles.tagline}>Pequenas escolhas, grandes transformações.</p>
          </div>

          <div id="hero-cta" className={styles.bottom}>
            <p className={styles.lead}>
              Nutrição clínica sem dietas restritivas. Um plano construído para a sua rotina, e
              acompanhamento de perto para ele durar.
            </p>
            <ArrowButton label="Agendar consulta" href="#contato" />
          </div>
        </div>
      </div>

      {/* Pista de rolagem: sem ela o hero mede exatamente 100svh, a página não
          rola e o frame nunca abre. Quando a próxima seção entrar, ela passa a
          ser a pista e este espaçador sai. */}
      <div id="fim-hero" className={styles.runway} aria-hidden="true" />
    </section>
  );
}
