"use client";

import { useEffect, useState } from "react";
import styles from "./habitos.module.css";

import PatientShell from "@/components/organisms/PatientShell/PatientShell";
import Icon from "@/components/atoms/Icon/Icon";
import ScoreGauge from "@/components/molecules/ScoreGauge/ScoreGauge";
import Skeleton from "@/components/atoms/Skeleton/Skeleton";
import { scoreOf, WATER_GOAL_ML, waterGoal, CONTAINERS, litrosFromMl } from "@/data/habits";
import { apiGet, apiPost } from "@/lib/api";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function HabitosPage() {
  const [pid, setPid] = useState(null);
  const [goal, setGoal] = useState(WATER_GOAL_ML);
  const [h, setH] = useState(null); // null = carregando
  const [mlInput, setMlInput] = useState(""); // ml digitados manualmente

  useEffect(() => {
    let active = true;
    (async () => {
      let id = null;
      // busca o perfil (id + peso pra meta de água)
      try {
        const p = await apiGet("/users/me/profile");
        id = p && p.id;
        if (active && p) setGoal(waterGoal(p.weightKg));
        if (id) localStorage.setItem("bn_profile_id", id);
      } catch {
        /* sem perfil */
      }
      if (active) setPid(id);

      if (id) {
        try {
          const m = await apiGet(`/health-metrics/${todayISO()}?patientProfileId=${id}`);
          if (active) {
            setH(
              m
                ? { treino: !!m.trainedToday, sono: m.sleepHours != null && Number(m.sleepHours) >= 7, agua: Number(m.waterMl) || 0 }
                : { treino: false, sono: false, agua: 0 }
            );
          }
        } catch {
          if (active) setH({ treino: false, sono: false, agua: 0 });
        }
      } else if (active) {
        setH({ treino: false, sono: false, agua: 0 });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // atualização otimista + persistência na API
  function update(patch) {
    if (!h) return;
    const next = { ...h, ...patch };
    setH(next);
    if (pid) {
      apiPost("/health-metrics", {
        patientProfileId: pid,
        date: todayISO(),
        trainedToday: next.treino,
        sleepHours: next.sono ? 8 : 0,
        waterMl: next.agua,
      }).catch(() => {
        /* offline: mantém o estado local */
      });
    }
  }

  const score = h ? scoreOf(h, goal) : 0;

  if (h === null) {
    return (
      <PatientShell active="" title="Seus hábitos" subtitle="Marque como foi seu dia">
        <div className={styles.scoreCard}>
          <div className={styles.scoreHead}>
            <span className={styles.scoreTitle}>Pontuação de hoje</span>
          </div>
          <Skeleton circle width={120} height={120} />
        </div>
        <div className={styles.loadStack}>
          <Skeleton width="100%" height={70} radius="var(--radius-lg)" />
          <Skeleton width="100%" height={70} radius="var(--radius-lg)" />
          <Skeleton width="100%" height={210} radius="var(--radius-lg)" />
        </div>
      </PatientShell>
    );
  }

  const pct = Math.min(100, Math.round((h.agua / goal) * 100));

  return (
    <PatientShell active="" title="Seus hábitos" subtitle="Marque como foi seu dia">
      <div className={styles.scoreCard}>
        <div className={styles.scoreHead}>
          <span className={styles.scoreTitle}>Pontuação de hoje</span>
        </div>
        <ScoreGauge score={score} />
      </div>

      <button type="button" className={`${styles.habit} ${h.treino ? styles.habitOn : ""}`} onClick={() => update({ treino: !h.treino })}>
        <span className={styles.habitIcon}>
          <Icon name="dumbbell" size={22} />
        </span>
        <span className={styles.habitText}>
          <span className={styles.habitTitle}>Treino</span>
          <span className={styles.habitSub}>Você treinou hoje?</span>
        </span>
        <span className={styles.check}>{h.treino && <Icon name="check" size={16} strokeWidth={3} />}</span>
      </button>

      <button type="button" className={`${styles.habit} ${h.sono ? styles.habitOn : ""}`} onClick={() => update({ sono: !h.sono })}>
        <span className={styles.habitIcon}>
          <Icon name="moon" size={22} />
        </span>
        <span className={styles.habitText}>
          <span className={styles.habitTitle}>Sono</span>
          <span className={styles.habitSub}>Dormiu 8 horas?</span>
        </span>
        <span className={styles.check}>{h.sono && <Icon name="check" size={16} strokeWidth={3} />}</span>
      </button>

      <div className={`${styles.habit} ${styles.habitCol} ${h.agua >= goal ? styles.habitOn : ""}`}>
        <div className={styles.waterHead}>
          <span className={styles.habitIcon}>
            <Icon name="water" size={22} />
          </span>
          <span className={styles.habitText}>
            <span className={styles.habitTitle}>Água</span>
            <span className={styles.habitSub}>
              {litrosFromMl(h.agua)} L de {litrosFromMl(goal)} L · {h.agua} ml
            </span>
          </span>
          {h.agua > 0 && (
            <button type="button" className={styles.clearBtn} onClick={() => update({ agua: 0 })}>
              Zerar
            </button>
          )}
        </div>

        <div className={styles.waterBar}>
          <span className={styles.waterFill} style={{ "--w": `${pct}%` }} />
        </div>

        <div className={styles.containers}>
          {CONTAINERS.map((c) => (
            <button key={c.label} type="button" className={styles.containerBtn} onClick={() => update({ agua: h.agua + c.ml })}>
              <Icon name="water" size={16} />
              <span className={styles.containerLabel}>{c.label}</span>
              <span className={styles.containerMl}>+{c.ml} ml</span>
            </button>
          ))}
        </div>

        {/* digitar a quantidade exata em ml */}
        <div className={styles.mlRow}>
          <input
            className={styles.mlInput}
            type="number"
            inputMode="numeric"
            min="0"
            value={mlInput}
            placeholder="Quanto você bebeu?"
            onChange={(e) => setMlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && Number(mlInput) > 0) {
                update({ agua: h.agua + Math.round(Number(mlInput)) });
                setMlInput("");
              }
            }}
          />
          <span className={styles.mlUnit}>ml</span>
          <button
            type="button"
            className={styles.mlAdd}
            disabled={!(Number(mlInput) > 0)}
            onClick={() => {
              update({ agua: h.agua + Math.round(Number(mlInput)) });
              setMlInput("");
            }}
          >
            <Icon name="plus" size={16} /> Adicionar
          </button>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Meta diária</span>
          <span className={styles.metaVal}>{litrosFromMl(goal)} L</span>
        </div>
      </div>
    </PatientShell>
  );
}
