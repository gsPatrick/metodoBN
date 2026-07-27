"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { initGsap } from "@/lib/registerGsap";
import ProductPreview from "./ProductPreview";
import styles from "./HeroIntegrated.module.css";

/* Troque para video quando quiser: { type: "video", src: "/videos/hero-loop.mp4" } */
const HERO_MEDIA = { type: "image", src: "/login.jpg" };

const HEADING_LINES = ["Engenharia do futuro", "da nutrição inteligente."];
const SUB_LINES = [
  "Conectamos consultório, ciência e rotina com anamnese digital,",
  "planos alimentares e chat em tempo real.",
];

const SCROLLER_STEPS = [
  "A nutrição é um sistema complexo entre corpo, hábito e rotina. Nossa plataforma foi construída para desvendar essa rede.",
  "Combinando ciência clínica, tecnologia e acompanhamento contínuo, conectamos nutricionista e paciente com precisão.",
  "Através do Método BN, desbloqueamos um novo jeito de cuidar — do consultório até o dia a dia.",
];

const SCROLL_DISTANCE = 3000;

function CharText({ text }) {
  return text.split("").map((char, index) => (
    <span key={`${char}-${index}`} className={styles.char}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export default function HeroIntegrated() {
  const sectionRef = useRef(null);
  const scrollerRef = useRef(null);
  const canvasRef = useRef(null);
  const progressBarRef = useRef(null);
  const indexRef = useRef(null);
  const introHeadingRef = useRef(null);
  const introBottomRef = useRef(null);
  const stepRefs = useRef([]);

  const [activeStep, setActiveStep] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    let ctx;
    let cancelled = false;

    initGsap().then((libs) => {
      if (cancelled || !libs) return;
      const { gsap, ScrollTrigger } = libs;

      const section = sectionRef.current;
      const scroller = scrollerRef.current;
      const canvas = canvasRef.current;
      const progressBar = progressBarRef.current;
      const indexEl = indexRef.current;
      const introHeading = introHeadingRef.current;
      const introBottom = introBottomRef.current;
      const steps = stepRefs.current.filter(Boolean);

      if (!section || !scroller || !canvas) return;

      const isDesktop = window.matchMedia("(min-width: 1025px)").matches;
      const clipRound = isDesktop ? 200 : 100;
      const clipStart = `inset(50% round ${clipRound}px)`;
      const clipEnd = "inset(0% round 0px)";

      gsap.set(canvas, { clipPath: clipStart });
      if (progressBar) gsap.set(progressBar, { scaleX: 0, transformOrigin: "0% 50%" });

      ctx = gsap.context(() => {
        const introLines = [
          ...(introHeading?.querySelectorAll(`.${styles.line}`) || []),
          ...(introBottom?.querySelectorAll(`.${styles.line}`) || []),
        ];

        gsap.set(introLines, { yPercent: 110 });
        if (introBottom) gsap.set(introBottom, { opacity: 0, y: 20 });

        const loadTl = gsap.timeline({ defaults: { ease: "power3.out" } });
        loadTl
          .to(introLines, { yPercent: 0, duration: 1, stagger: 0.08 })
          .to(introBottom, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");

        const scrollConfig = {
          trigger: section,
          start: "top top",
          end: `+=${SCROLL_DISTANCE}`,
          scrub: 0.6,
        };

        gsap.fromTo(
          canvas,
          { clipPath: clipStart },
          { clipPath: clipEnd, ease: "none", scrollTrigger: scrollConfig }
        );

        if (progressBar) {
          gsap.fromTo(
            progressBar,
            { scaleX: 0, transformOrigin: "0% 50%" },
            { scaleX: 1, ease: "none", scrollTrigger: scrollConfig }
          );
        }

        ScrollTrigger.create({
          ...scrollConfig,
          pin: scroller,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            const stepIndex = Math.min(2, Math.floor(p * 3));

            setActiveStep(stepIndex);
            setPreviewVisible(p > 0.35);

            if (indexEl) {
              indexEl.textContent = String(stepIndex + 1).padStart(2, "0");
            }

            steps.forEach((step, i) => {
              const chars = step.querySelectorAll(`.${styles.char}`);
              const stepStart = i / 3;
              const stepEnd = (i + 1) / 3;
              const local =
                p <= stepStart ? 0 : p >= stepEnd ? 1 : (p - stepStart) / (stepEnd - stepStart);

              step.style.opacity = i === stepIndex ? "1" : "0";
              step.style.visibility = i === stepIndex ? "inherit" : "hidden";

              chars.forEach((char, ci) => {
                const charProgress = Math.min(1, Math.max(0, local * 1.4 - ci * 0.008));
                char.style.opacity = String(0.35 + charProgress * 0.65);
              });
            });
          },
        });
      }, section);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero}>
      <div className={styles.main}>
        <hgroup className={styles.mainInner}>
          <h1 ref={introHeadingRef} className={styles.mainHeading}>
            {HEADING_LINES.map((line) => (
              <div key={line} className={styles.lineMask}>
                <div className={styles.line}>{line}</div>
              </div>
            ))}
          </h1>
          <div ref={introBottomRef} className={styles.mainBottom}>
            <h2 className={styles.mainText}>
              {SUB_LINES.map((line) => (
                <div key={line} className={styles.lineMask}>
                  <div className={styles.line}>
                    <p>{line}</p>
                  </div>
                </div>
              ))}
            </h2>
            <Link href="/login" className={styles.cta}>
              <span>Conhecer a plataforma</span>
              <span className={styles.ctaIcon} aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </hgroup>
      </div>

      <div ref={scrollerRef} className={styles.scroller}>
        <div className={styles.scrollerHead}>
          <div className={styles.scrollerLabel}>O que fazemos</div>
        </div>
        <div className={styles.scrollerBody}>
          <div className={styles.scrollerProgress}>
            <div ref={progressBarRef} className={styles.progressBar} />
          </div>
          <div className={styles.scrollerContent}>
            <aside className={styles.contentIndex}>
              <div className={styles.indexInner}>
                <span ref={indexRef} className={styles.indexCurrent}>
                  01
                </span>
                <span className={styles.indexDivider}>/</span>
                <span className={styles.indexTotal}>03</span>
              </div>
            </aside>
            <div className={styles.contentMain}>
              <div className={styles.itemsInner}>
                {SCROLLER_STEPS.map((text, index) => (
                  <div
                    key={text}
                    ref={(el) => {
                      stepRefs.current[index] = el;
                    }}
                    className={styles.mainItem}
                  >
                    <p>
                      <CharText text={text} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <figure className={styles.background}>
        <div className={styles.backgroundFrame}>
          <div ref={canvasRef} className={styles.backgroundCanvas}>
            {HERO_MEDIA.type === "video" ? (
              <video
                className={styles.media}
                src={HERO_MEDIA.src}
                autoPlay
                muted
                loop
                playsInline
                poster="/login.jpg"
              />
            ) : (
              <Image
                src={HERO_MEDIA.src}
                alt=""
                fill
                priority
                className={styles.media}
                sizes="100vw"
              />
            )}
            <ProductPreview activeStep={activeStep} visible={previewVisible} />
          </div>
        </div>
      </figure>
    </section>
  );
}
