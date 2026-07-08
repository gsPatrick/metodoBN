"use client";

import { useEffect } from "react";
import styles from "./LoginTransition.module.css";
import Logo from "@/components/atoms/Logo/Logo";
import Icon from "@/components/atoms/Icon/Icon";
import Fruit from "@/components/atoms/Fruit/Fruit";

// Animação de boas-vindas após o login.
// variant: "nutri" (painel) | "patient" (app do paciente).
export default function LoginTransition({ variant = "nutri", name, onDone, duration = 2300 }) {
  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  const first = (name || "").trim().split(/\s+/)[0] || "";

  if (variant === "patient") {
    const fruits = ["morango", "banana", "laranja", "maca", "morango", "laranja"];
    return (
      <div className={`${styles.screen} ${styles.patient}`} data-theme="dark" style={{ "--dur": `${duration}ms` }}>
        <div className={styles.fruits} aria-hidden="true">
          {fruits.map((f, i) => (
            <span key={i} className={`${styles.fruit} ${styles[`p${i + 1}`]}`}>
              <Fruit name={f} fallback="apple" size={i % 2 ? 34 : 46} />
            </span>
          ))}
        </div>
        <div className={styles.center}>
          <span className={styles.pulse}>
            <span className={styles.pulseRing} />
            <span className={styles.pulseCore}>
              <Icon name="leaf" size={34} />
            </span>
          </span>
          <h1 className={styles.hello}>
            Olá{first ? `, ${first}` : ""}! <span className={styles.wave}>👋</span>
          </h1>
          <p className={styles.sub}>Preparando o seu dia…</p>
        </div>
        <span className={styles.flash} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={`${styles.screen} ${styles.nutri}`} data-theme="dark" style={{ "--dur": `${duration}ms` }}>
      <div className={styles.center}>
        <span className={styles.badge}>
          <span className={styles.badgeRing} />
          <Icon name="check" size={30} strokeWidth={2.4} />
        </span>
        <span className={styles.logo}>
          <Logo size="lg" showName />
        </span>
        <h1 className={styles.hello}>Bem-vinda{first ? `, ${first}` : ""}</h1>
        <p className={styles.sub}>Abrindo o seu painel…</p>
        <span className={styles.bar}>
          <span className={styles.barFill} />
        </span>
      </div>
      <span className={styles.flash} aria-hidden="true" />
    </div>
  );
}
