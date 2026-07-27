"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./WordReveal.module.css";

/**
 * Revelação palavra a palavra: cada palavra entra saindo do desfoque, escalonada.
 * É o "word blur reveal" do arquétipo Editorial (archetypes.md).
 *
 * `segments` permite cor diferente por trecho sem quebrar o escalonamento — o
 * índice das palavras corre contínuo entre os segmentos:
 *   [{ text: "O que é o" }, { text: "Método BN?", className: styles.marca }]
 */
export default function WordReveal({
  segments,
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger = 70,
  ...rest
}) {
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(false);
  const [semMovimento, setSemMovimento] = useState(false);

  useEffect(() => {
    // A skill exige respeitar reduce — o componente de referência não respeita.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setSemMovimento(true);
      setVisivel(true);
      return undefined;
    }

    const el = ref.current;
    if (!el) return undefined;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Numera as palavras de forma contínua para o atraso não reiniciar por segmento.
  let indice = -1;

  return (
    <Tag ref={ref} className={`${styles.reveal} ${className}`} {...rest}>
      {segments.map((seg, s) => {
        const palavras = seg.text.split(" ");
        return palavras.map((palavra, p) => {
          indice += 1;
          const ultima = s === segments.length - 1 && p === palavras.length - 1;
          return (
            <span
              key={`${s}-${p}`}
              className={`${styles.palavra} ${seg.className || ""}`}
              style={
                semMovimento
                  ? undefined
                  : {
                      transitionDelay: visivel ? `${delay + indice * stagger}ms` : "0ms",
                      opacity: visivel ? 1 : 0,
                      // "none", e não "blur(0)": um filtro ativo cria região de
                      // recorte própria e com entrelinha apertada isso decepa
                      // acentos da primeira linha (o til de "anotações").
                      filter: visivel ? "none" : "blur(6px)",
                      transform: visivel ? "translateY(0)" : "translateY(12px)",
                    }
              }
            >
              {palavra}
              {ultima ? "" : " "}
            </span>
          );
        });
      })}
    </Tag>
  );
}
