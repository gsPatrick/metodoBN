"use client";

import styles from "./ScoreGauge.module.css";
import { levelOf } from "@/data/habits";

export default function ScoreGauge({ score = 0 }) {
  const lvl = levelOf(score);
  return (
    <div className={styles.gauge}>
      <div className={styles.top}>
        <span className={styles.face}>{lvl.face}</span>
        <span className={styles.text}>
          <span className={styles.score}>
            {score}
            <small>/100</small>
          </span>
          <span className={styles.label}>{lvl.label}</span>
        </span>
      </div>
      <div className={styles.bar}>
        <span className={styles.pointer} style={{ "--p": `${score}%` }} />
      </div>
    </div>
  );
}
