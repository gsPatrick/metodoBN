"use client";

import styles from "./MacroSummary.module.css";
import Icon from "@/components/atoms/Icon/Icon";

function Legend({ kind, label, grams, pct }) {
  return (
    <div className={styles.legend}>
      <span className={styles.legendTop}>
        <span className={`${styles.legendDot} ${styles[`dot_${kind}`]}`} />
        <span className={styles.legendLabel}>{label}</span>
      </span>
      <span className={styles.legendVal}>
        {grams}g <span className={styles.legendPct}>· {pct}%</span>
      </span>
    </div>
  );
}

// totals = metas do plano { kcal, c, p, l }; consumed = consumido hoje (ou null = mostra o plano cheio)
export default function MacroSummary({ totals, consumed = null }) {
  const goalKcal = totals.kcal;
  const cm = consumed || { c: totals.c, p: totals.p, l: totals.l, kcal: totals.kcal };
  const cKcal = Math.round(consumed ? consumed.kcal : totals.kcal);
  const cCal = cm.c * 4;
  const pCal = cm.p * 4;
  const lCal = cm.l * 9;
  const sum = cCal + pCal + lCal || 1;
  const pctC = Math.round((cCal / sum) * 100);
  const pctP = Math.round((pCal / sum) * 100);
  const pctL = Math.round((lCal / sum) * 100);
  const segC = Math.min(100, (cCal / goalKcal) * 100);
  const segP = Math.min(100, (pCal / goalKcal) * 100);
  const segL = Math.min(100, (lCal / goalKcal) * 100);

  return (
    <div className={styles.summary}>
      {/* header — kcal em destaque */}
      <div className={styles.kcalRow}>
        <span className={styles.kcalIcon}>
          <Icon name="flame" size={20} />
        </span>
        <span className={styles.kcalNum}>{cKcal}</span>
        <span className={styles.kcalUnit}>{consumed ? `/ ${goalKcal} kcal hoje` : "kcal / dia"}</span>
      </div>

      {/* barra logo acima dos macros */}
      <div className={styles.barBlock}>
        <div className={styles.macroBar}>
          <span className={styles.segC} style={{ "--w": `${segC}%` }} />
          <span className={styles.segP} style={{ "--w": `${segP}%` }} />
          <span className={styles.segL} style={{ "--w": `${segL}%` }} />
        </div>
        <div className={styles.macroLegend}>
          <Legend kind="c" label="Carboidratos" grams={cm.c} pct={pctC} />
          <Legend kind="p" label="Proteínas" grams={cm.p} pct={pctP} />
          <Legend kind="l" label="Gorduras" grams={cm.l} pct={pctL} />
        </div>
      </div>
    </div>
  );
}
