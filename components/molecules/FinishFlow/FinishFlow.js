"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/atoms/Icon/Icon";
import styles from "./FinishFlow.module.css";

/* Animação de finalização: troca ícones + frases em sequência,
   termina num estado de sucesso e chama onDone. */
export default function FinishFlow({ steps, onDone, intervalMs = 1100, doneDelayMs = 1400 }) {
  const [i, setI] = useState(0);
  const last = steps.length - 1;

  useEffect(() => {
    if (i < last) {
      const t = setTimeout(() => setI((v) => v + 1), intervalMs);
      return () => clearTimeout(t);
    }
    if (onDone) {
      const t = setTimeout(onDone, doneDelayMs);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [i, last, onDone, intervalMs, doneDelayMs]);

  const step = steps[i] || steps[last];
  const done = i >= last;

  return (
    <div className={styles.wrap}>
      <div className={`${styles.ring} ${done ? styles.done : ""}`}>
        <span key={i} className={styles.icon}>
          <Icon name={step.icon} size={42} strokeWidth={1.9} />
        </span>
      </div>
      <p key={`p${i}`} className={styles.phrase}>
        {step.phrase}
      </p>
      <div className={styles.dots}>
        {steps.map((_, idx) => (
          <span key={idx} className={`${styles.dot} ${idx <= i ? styles.dotOn : ""}`} />
        ))}
      </div>
    </div>
  );
}
