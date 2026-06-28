"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/atoms/Icon/Icon";
import { apiGet } from "@/lib/api";
import styles from "./FoodItemModal.module.css";

const r0 = (v) => Math.round(Number(v) || 0);

// Modal pra adicionar/editar um item da refeição: escolhe o alimento da tabela,
// a medida caseira/quantidade e as alternativas (trocas).
export default function FoodItemModal({ initial, onSave, onClose, onRemove }) {
  const isEdit = !!(initial && initial.itemId);
  const [food, setFood] = useState(null); // alimento da tabela { id, name, kcal, householdMeasures }
  const [customName] = useState(initial ? initial.name : "");
  const [measure, setMeasure] = useState(null); // medida caseira (null = gramas)
  const [count, setCount] = useState(1); // qtd de medidas
  const [grams, setGrams] = useState(initial ? Math.max(1, Math.round(Number(initial.quantity) || 100)) : 100);
  const [subs, setSubs] = useState(initial && Array.isArray(initial.substitutions) ? initial.substitutions : []);
  const [saving, setSaving] = useState(false);

  // busca compartilhada: alvo "food" (alimento principal) ou "sub" (alternativa)
  const [target, setTarget] = useState(initial && (initial.foodId || initial.name) ? null : "food");
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // edit com foodId → carrega o alimento (p/ ter medidas + kcal/100g)
  useEffect(() => {
    if (initial && initial.foodId) {
      apiGet(`/foods/${initial.foodId}`)
        .then((f) => f && setFood(f))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!target || term.length < 2) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    let active = true;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const items = await apiGet(`/foods?q=${encodeURIComponent(term)}&limit=20`);
        if (active) {
          setResults(Array.isArray(items) ? items : []);
          setSearching(false);
        }
      } catch {
        if (active) {
          setResults([]);
          setSearching(false);
        }
      }
    }, 280);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q, target]);

  function pickResult(f) {
    if (target === "food") {
      setFood(f);
      const ms = f.householdMeasures || [];
      setMeasure(ms[0] || null);
      setCount(1);
      setGrams(ms[0] ? Math.round(ms[0].grams) : 100);
    } else if (target === "sub") {
      setSubs((s) => (s.some((x) => (x.name || x) === f.name) ? s : [...s, { name: f.name }]));
    }
    setTarget(null);
    setQ("");
    setResults([]);
  }

  const measures = (food && food.householdMeasures) || [];
  const kcal100 = food ? Number(food.kcal) : null;
  const effGrams = measure ? Math.round(measure.grams * count) : Math.round(grams);
  const kcalPreview = kcal100 != null ? Math.round((kcal100 * effGrams) / 100) : initial ? r0(initial.kcal) : 0;
  const displayName = food ? food.name : customName || "Alimento";
  const canSave = !!(food || customName);

  function save() {
    if (saving) return;
    setSaving(true);
    const quantityLabel = measure ? `${+Number(count).toFixed(2)} ${measure.label}` : `${effGrams} g`;
    onSave({
      foodId: food ? food.id : (initial && initial.foodId) || null,
      customFoodName: displayName,
      quantity: effGrams,
      unit: measure ? measure.label : "g",
      quantityLabel,
      substitutions: subs,
    });
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h3 className={styles.title}>{isEdit ? "Editar alimento" : "Adicionar alimento"}</h3>
          <button type="button" className={styles.x} onClick={onClose} aria-label="Fechar">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {/* busca ativa (alimento ou alternativa) */}
          {target ? (
            <div className={styles.searchPanel}>
              <div className={styles.searchBox}>
                <Icon name="search" size={16} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={target === "sub" ? "Buscar alternativa…" : "Buscar alimento na tabela…"} autoFocus />
                {(food || customName) && (
                  <button type="button" className={styles.linkBtn} onClick={() => { setTarget(null); setQ(""); }}>
                    Cancelar
                  </button>
                )}
              </div>
              <div className={styles.results}>
                {searching && <span className={styles.state}>Buscando…</span>}
                {!searching && q.trim().length >= 2 && results.length === 0 && <span className={styles.state}>Nada encontrado.</span>}
                {results.map((f) => (
                  <button key={f.id} type="button" className={styles.result} onClick={() => pickResult(f)}>
                    <span className={styles.rName}>{f.name}</span>
                    <span className={styles.rKcal}>
                      {r0(f.kcal)} kcal/100g · {f.source}
                      {f.householdMeasures && f.householdMeasures.length ? " · medidas" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* alimento escolhido */}
              <div className={styles.foodRow}>
                <span className={styles.foodText}>
                  <span className={styles.foodName}>{displayName}</span>
                  <span className={styles.foodKcal}>{kcal100 != null ? `${r0(kcal100)} kcal/100g` : "sem dados — selecione na tabela"}</span>
                </span>
                <button type="button" className={styles.linkBtn} onClick={() => { setTarget("food"); setQ(""); }}>
                  {food ? "Trocar" : "Selecionar"}
                </button>
              </div>

              {/* medida caseira / quantidade */}
              {measures.length > 0 && (
                <div className={styles.chips}>
                  {measures.map((m) => (
                    <button key={m.label} type="button" className={`${styles.chip} ${measure && measure.label === m.label ? styles.chipOn : ""}`} onClick={() => { setMeasure(m); setCount(1); }}>
                      {m.label} <b>{r0(m.grams)}g</b>
                    </button>
                  ))}
                  <button type="button" className={`${styles.chip} ${!measure ? styles.chipOn : ""}`} onClick={() => setMeasure(null)}>
                    Gramas
                  </button>
                </div>
              )}

              <div className={styles.qtyRow}>
                <button
                  type="button"
                  className={styles.step}
                  onClick={() =>
                    measure ? setCount((c) => Math.max(0.5, +(Number(c) - 0.5).toFixed(2))) : setGrams((g) => Math.max(10, g - 10))
                  }
                >
                  −
                </button>
                <span className={styles.qtyVal}>{measure ? `${count} ${measure.label.toLowerCase()}` : `${grams} g`}</span>
                <button type="button" className={styles.step} onClick={() => (measure ? setCount((c) => +(Number(c) + 0.5).toFixed(2)) : setGrams((g) => g + 10))}>
                  +
                </button>
                <span className={styles.qtyPreview}>
                  = <b>{effGrams}g</b> · {kcalPreview} kcal
                </span>
              </div>

              {/* alternativas / trocas */}
              <div className={styles.subsSec}>
                <span className={styles.subsTitle}>
                  <Icon name="swap" size={14} /> Alternativas (trocas)
                </span>
                {subs.length === 0 && <span className={styles.subsEmpty}>Nenhuma. O paciente poderá trocar por estas opções.</span>}
                {subs.map((s, i) => (
                  <div key={i} className={styles.sub}>
                    <span className={styles.subName}>{s.name || String(s)}</span>
                    <button type="button" className={styles.x} onClick={() => setSubs((arr) => arr.filter((_, j) => j !== i))} aria-label="Remover">
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" className={styles.addSub} onClick={() => { setTarget("sub"); setQ(""); }}>
                  <Icon name="plus" size={14} /> Adicionar alternativa
                </button>
              </div>
            </>
          )}
        </div>

        {!target && (
          <div className={styles.footer}>
            {isEdit && (
              <button type="button" className={styles.remove} onClick={onRemove}>
                <Icon name="trash" size={16} /> Remover
              </button>
            )}
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className={styles.save} disabled={!canSave || saving} onClick={save}>
              <Icon name="check" size={16} /> {saving ? "Salvando…" : "Confirmar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
