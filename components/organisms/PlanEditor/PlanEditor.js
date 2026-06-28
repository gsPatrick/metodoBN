"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/atoms/Icon/Icon";
import Skeleton from "@/components/atoms/Skeleton/Skeleton";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import styles from "./PlanEditor.module.css";

const r0 = (v) => Math.round(Number(v) || 0);

function itemName(it) {
  return it.customFoodName || (it.food && it.food.name) || "Alimento";
}

export default function PlanEditor({ patientProfileId, onPlanChange }) {
  const [plan, setPlan] = useState(undefined); // undefined=carregando, null=sem plano, obj=plano
  const [busy, setBusy] = useState(false);
  const [pickerMeal, setPickerMeal] = useState(null); // mealId com o seletor de alimento aberto
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [pickFood, setPickFood] = useState(null); // alimento escolhido (etapa de medida)
  const [pickMeasure, setPickMeasure] = useState(null); // medida caseira escolhida (null = gramas)
  const [pickCount, setPickCount] = useState(1); // qtd de medidas, ou gramas se sem medida

  async function load(silent) {
    if (!silent) setPlan((p) => (p === undefined ? undefined : p));
    try {
      const list = await apiGet(`/diet-plans?patientProfileId=${patientProfileId}`);
      if (Array.isArray(list) && list.length) {
        const full = await apiGet(`/diet-plans/${list[0].id}`);
        setPlan(full);
        if (onPlanChange) onPlanChange(full);
      } else {
        setPlan(null);
      }
    } catch {
      setPlan(null);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientProfileId]);

  // busca de alimentos (TACO/TBCA)
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
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
    }, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q]);

  async function createPlan() {
    setBusy(true);
    try {
      const p = await apiPost("/diet-plans", { patientProfileId, title: "Plano alimentar" });
      setPlan(p);
      if (onPlanChange) onPlanChange(p);
    } catch {
      /* ignora */
    } finally {
      setBusy(false);
    }
  }
  async function addMeal() {
    if (!plan) return;
    setBusy(true);
    try {
      await apiPost(`/diet-plans/${plan.id}/meals`, { name: "Nova refeição", sortOrder: (plan.meals || []).length });
      await load(true);
    } catch {
      /* ignora */
    } finally {
      setBusy(false);
    }
  }
  async function patchMeal(mealId, data) {
    try {
      await apiPatch(`/diet-plans/meals/${mealId}`, data);
      await load(true);
    } catch {
      /* ignora */
    }
  }
  async function removeMeal(mealId) {
    try {
      await apiDelete(`/diet-plans/meals/${mealId}`);
      await load(true);
    } catch {
      /* ignora */
    }
  }
  function closePicker() {
    setPickerMeal(null);
    setPickFood(null);
    setPickMeasure(null);
    setPickCount(1);
    setQ("");
    setResults([]);
  }
  function selectFood(f) {
    const ms = f.householdMeasures || [];
    setPickFood(f);
    setPickMeasure(ms[0] || null);
    setPickCount(ms[0] ? 1 : 100);
  }
  function selectMeasure(m) {
    setPickMeasure(m);
    setPickCount(m ? 1 : 100);
  }
  async function addItem(mealId) {
    if (!pickFood) return;
    const c = Math.max(pickMeasure ? 0.25 : 1, Number(pickCount) || (pickMeasure ? 1 : 100));
    const grams = pickMeasure ? Math.round(pickMeasure.grams * c) : Math.round(c);
    const quantityLabel = pickMeasure ? `${+c.toFixed(2)} ${pickMeasure.label}` : `${grams} g`;
    try {
      await apiPost(`/diet-plans/meals/${mealId}/items`, {
        foodId: pickFood.id,
        customFoodName: pickFood.name,
        quantity: grams,
        unit: pickMeasure ? pickMeasure.label : "g",
        quantityLabel,
      });
      closePicker();
      await load(true);
    } catch {
      /* ignora */
    }
  }
  async function setGrams(itemId, grams) {
    const g = Math.max(1, Math.round(grams));
    try {
      await apiPatch(`/diet-plans/items/${itemId}`, { quantity: g, unit: "g", quantityLabel: null });
      await load(true);
    } catch {
      /* ignora */
    }
  }
  async function removeItem(itemId) {
    try {
      await apiDelete(`/diet-plans/items/${itemId}`);
      await load(true);
    } catch {
      /* ignora */
    }
  }
  async function approve() {
    if (!plan) return;
    setBusy(true);
    try {
      await apiPost(`/diet-plans/${plan.id}/approve`, {});
      await load(true);
    } catch {
      /* ignora */
    } finally {
      setBusy(false);
    }
  }

  // ---------- estados ----------
  if (plan === undefined) {
    return (
      <div className={styles.wrap}>
        <Skeleton width="100%" height={70} radius="var(--radius-lg)" />
        <div className={styles.gap} />
        <Skeleton width="100%" height={140} radius="var(--radius-lg)" />
        <div className={styles.gap} />
        <Skeleton width="100%" height={140} radius="var(--radius-lg)" />
      </div>
    );
  }
  if (plan === null) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <Icon name="utensils" size={30} />
        </span>
        <h3 className={styles.emptyTitle}>Nenhum plano ainda</h3>
        <p className={styles.emptyText}>Monte o plano alimentar aqui escolhendo os alimentos da tabela, ou envie o PDF na aba “Plano alimentar”.</p>
        <button type="button" className={styles.primaryBtn} disabled={busy} onClick={createPlan}>
          <Icon name="plus" size={18} /> {busy ? "Criando…" : "Criar plano alimentar"}
        </button>
      </div>
    );
  }

  const meals = (plan.meals || []).slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const total = meals.reduce(
    (a, m) => ({
      kcal: a.kcal + Number(m.kcal || 0),
      c: a.c + Number(m.carbsG || 0),
      p: a.p + Number(m.proteinG || 0),
      l: a.l + Number(m.fatG || 0),
    }),
    { kcal: 0, c: 0, p: 0, l: 0 }
  );
  const approved = plan.status === "approved";

  return (
    <div className={styles.wrap}>
      {/* resumo + ações */}
      <div className={styles.headCard}>
        <div className={styles.headTop}>
          <span className={styles.headTitle}>{plan.title || "Plano alimentar"}</span>
          <span className={`${styles.statusTag} ${approved ? styles.stApproved : styles.stDraft}`}>{approved ? "Liberado" : "Rascunho"}</span>
        </div>
        <div className={styles.totals}>
          <span className={styles.totKcal}>
            <b>{r0(total.kcal)}</b> kcal
          </span>
          <span className={styles.tot}>C {r0(total.c)}g</span>
          <span className={styles.tot}>P {r0(total.p)}g</span>
          <span className={styles.tot}>G {r0(total.l)}g</span>
          {plan.targetKcal ? <span className={styles.target}>meta ~{r0(plan.targetKcal)} kcal</span> : null}
        </div>
        {!approved && (
          <button type="button" className={styles.approveBtn} disabled={busy || meals.length === 0} onClick={approve}>
            <Icon name="check" size={18} /> Liberar plano pro paciente
          </button>
        )}
      </div>

      {/* refeições */}
      {meals.map((m) => {
        const items = (m.items || []).slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        return (
          <div key={m.id} className={styles.meal}>
            <div className={styles.mealHead}>
              <input
                className={styles.mealName}
                defaultValue={m.name}
                onBlur={(e) => e.target.value.trim() && e.target.value !== m.name && patchMeal(m.id, { name: e.target.value.trim() })}
              />
              <input
                className={styles.mealTime}
                type="time"
                defaultValue={(m.preferredTime || "").slice(0, 5)}
                onBlur={(e) => e.target.value !== (m.preferredTime || "").slice(0, 5) && patchMeal(m.id, { preferredTime: e.target.value || null })}
              />
              <button type="button" className={styles.iconBtn} onClick={() => removeMeal(m.id)} aria-label="Remover refeição">
                <Icon name="trash" size={16} />
              </button>
            </div>

            {items.map((it) => (
              <div key={it.id} className={styles.item}>
                <span className={styles.itemText}>
                  <span className={styles.itemName}>{itemName(it)}</span>
                  {it.unit && it.unit !== "g" && it.quantityLabel ? <span className={styles.itemMeasure}>{it.quantityLabel}</span> : null}
                </span>
                <span className={styles.gramsBox}>
                  <button type="button" className={styles.stepBtn} onClick={() => setGrams(it.id, Number(it.quantity) - 10)}>
                    −
                  </button>
                  <span className={styles.gramsVal}>{r0(it.quantity)}g</span>
                  <button type="button" className={styles.stepBtn} onClick={() => setGrams(it.id, Number(it.quantity) + 10)}>
                    +
                  </button>
                </span>
                <span className={styles.itemKcal}>{r0(it.kcal)} kcal</span>
                <button type="button" className={styles.iconBtn} onClick={() => removeItem(it.id)} aria-label="Remover item">
                  <Icon name="close" size={15} />
                </button>
              </div>
            ))}

            {pickerMeal === m.id ? (
              <div className={styles.picker}>
                {!pickFood ? (
                  <>
                    <div className={styles.pickerSearch}>
                      <Icon name="search" size={16} />
                      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar alimento na tabela…" autoFocus />
                      <button type="button" className={styles.iconBtn} onClick={closePicker} aria-label="Fechar">
                        <Icon name="close" size={15} />
                      </button>
                    </div>
                    <div className={styles.pickerResults}>
                      {searching && <span className={styles.pickerState}>Buscando…</span>}
                      {!searching && q.trim().length >= 2 && results.length === 0 && <span className={styles.pickerState}>Nada encontrado.</span>}
                      {results.map((f) => (
                        <button key={f.id} type="button" className={styles.pickerItem} onClick={() => selectFood(f)}>
                          <span className={styles.piName}>{f.name}</span>
                          <span className={styles.piKcal}>
                            {r0(f.kcal)} kcal/100g · {f.source}
                            {f.householdMeasures && f.householdMeasures.length ? " · medidas" : ""}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles.measurePanel}>
                    <span className={styles.mpName}>{pickFood.name}</span>
                    <div className={styles.mpChips}>
                      {(pickFood.householdMeasures || []).map((m2) => (
                        <button
                          key={m2.label}
                          type="button"
                          className={`${styles.mpChip} ${pickMeasure && pickMeasure.label === m2.label ? styles.mpChipOn : ""}`}
                          onClick={() => selectMeasure(m2)}
                        >
                          {m2.label} <b>{r0(m2.grams)}g</b>
                        </button>
                      ))}
                      <button type="button" className={`${styles.mpChip} ${!pickMeasure ? styles.mpChipOn : ""}`} onClick={() => selectMeasure(null)}>
                        Gramas
                      </button>
                    </div>
                    <div className={styles.mpQty}>
                      <button
                        type="button"
                        className={styles.stepBtn}
                        onClick={() => setPickCount((c) => Math.max(pickMeasure ? 0.5 : 10, +(Number(c) - (pickMeasure ? 0.5 : 10)).toFixed(2)))}
                      >
                        −
                      </button>
                      <span className={styles.mpQtyVal}>{pickMeasure ? `${pickCount} ${pickMeasure.label.toLowerCase()}` : `${pickCount} g`}</span>
                      <button type="button" className={styles.stepBtn} onClick={() => setPickCount((c) => +(Number(c) + (pickMeasure ? 0.5 : 10)).toFixed(2))}>
                        +
                      </button>
                    </div>
                    <div className={styles.mpPreview}>
                      = <b>{pickMeasure ? Math.round(pickMeasure.grams * pickCount) : Math.round(pickCount)}g</b> ·{" "}
                      {Math.round((Number(pickFood.kcal) || 0) * ((pickMeasure ? pickMeasure.grams * pickCount : pickCount) / 100))} kcal
                    </div>
                    <div className={styles.mpActions}>
                      <button type="button" className={styles.back} onClick={() => { setPickFood(null); setPickMeasure(null); }}>
                        Voltar
                      </button>
                      <button type="button" className={styles.primaryBtnSm} onClick={() => addItem(m.id)}>
                        <Icon name="plus" size={16} /> Adicionar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className={styles.addItemBtn} onClick={() => { closePicker(); setPickerMeal(m.id); }}>
                <Icon name="plus" size={15} /> Adicionar alimento
              </button>
            )}

            <div className={styles.mealMacros}>
              <b>{r0(m.kcal)}</b> kcal · C {r0(m.carbsG)}g · P {r0(m.proteinG)}g · G {r0(m.fatG)}g
            </div>
          </div>
        );
      })}

      <button type="button" className={styles.addMealBtn} disabled={busy} onClick={addMeal}>
        <Icon name="plus" size={18} /> Adicionar refeição
      </button>
    </div>
  );
}
