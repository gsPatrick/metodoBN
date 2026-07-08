"use client";

import { useEffect, useState } from "react";
import styles from "./AddFoodSheet.module.css";
import Icon from "@/components/atoms/Icon/Icon";
import Spinner from "@/components/atoms/Spinner/Spinner";
import { apiGet } from "@/lib/api";

function num(v) {
  return v == null || isNaN(v) ? 0 : Number(v);
}

export default function AddFoodSheet({ mealName, onAdd, onClose }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState(null); // { name, per100: {kcal,c,p,l} }
  const [grams, setGrams] = useState(100);
  const [measLabel, setMeasLabel] = useState(null); // medida caseira selecionada (por label)

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const items = await apiGet(`/foods?q=${encodeURIComponent(term)}&limit=25`);
        if (!active) return;
        setResults(Array.isArray(items) ? items : []);
        setLoading(false);
      } catch {
        if (active) {
          setResults([]);
          setLoading(false);
        }
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q]);

  function pick(f) {
    const ms = f.householdMeasures || [];
    setSel({
      name: f.name,
      per100: { kcal: num(f.kcal), c: num(f.carbsG), p: num(f.proteinG), l: num(f.fatG) },
      measures: ms
    });
    setGrams(ms[0] ? Math.round(ms[0].grams) : 100);
    setMeasLabel(ms[0] ? ms[0].label : null);
  }

  function confirm() {
    const f = grams / 100;
    onAdd({
      name: sel.name,
      grams,
      kcal: Math.round(sel.per100.kcal * f),
      c: Math.round(sel.per100.c * f),
      p: Math.round(sel.per100.p * f),
      l: Math.round(sel.per100.l * f)
    });
  }

  const f = grams / 100;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <span className={styles.handle} />

        {!sel ? (
          <>
            <h3 className={styles.title}>Comeu algo a mais?</h3>
            <p className={styles.sub}>Busque na tabela nutricional o que você comeu além de {mealName}.</p>
            <div className={styles.search}>
              <Icon name="search" size={18} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar alimento… ex.: pão de queijo" autoFocus />
            </div>
            {loading && (
              <div className={styles.state}>
                <Spinner size="sm" /> Buscando…
              </div>
            )}
            {!loading && q.trim().length >= 2 && results.length === 0 && <div className={styles.state}>Nada encontrado.</div>}
            <div className={styles.results}>
              {results.map((f) => (
                <button key={f.id} type="button" className={styles.result} onClick={() => pick(f)}>
                  <span className={styles.resName}>{f.name}</span>
                  <span className={styles.resKcal}>{Math.round(num(f.kcal))} kcal /100g</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className={styles.title}>{sel.name}</h3>
            {sel.measures && sel.measures.length > 0 && (
              <div className={styles.measures}>
                {sel.measures.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    className={`${styles.measChip} ${measLabel === m.label ? styles.measChipOn : ""}`}
                    onClick={() => {
                      setGrams(Math.round(m.grams));
                      setMeasLabel(m.label);
                    }}
                  >
                    {m.label} <b>{Math.round(m.grams)}g</b>
                  </button>
                ))}
              </div>
            )}
            <div className={styles.gramsRow}>
              <button type="button" className={styles.stepBtn} onClick={() => { setGrams(Math.max(10, grams - 10)); setMeasLabel(null); }}>
                −
              </button>
              <span className={styles.gramsVal}>{grams} g</span>
              <button type="button" className={styles.stepBtn} onClick={() => { setGrams(grams + 10); setMeasLabel(null); }}>
                +
              </button>
            </div>
            <div className={styles.presets}>
              {[50, 100, 150, 200].map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`${styles.preset} ${!measLabel && grams === g ? styles.presetOn : ""}`}
                  onClick={() => { setGrams(g); setMeasLabel(null); }}
                >
                  {g}g
                </button>
              ))}
            </div>
            <div className={styles.preview}>
              <span className={styles.pvKcal}>
                <Icon name="flame" size={14} /> {Math.round(sel.per100.kcal * f)} kcal
              </span>
              <span className={styles.pv}>C {Math.round(sel.per100.c * f)}g</span>
              <span className={styles.pv}>P {Math.round(sel.per100.p * f)}g</span>
              <span className={styles.pv}>G {Math.round(sel.per100.l * f)}g</span>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.back} onClick={() => setSel(null)}>
                Voltar
              </button>
              <button type="button" className={styles.add} onClick={confirm}>
                <Icon name="plus" size={18} /> Adicionar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
