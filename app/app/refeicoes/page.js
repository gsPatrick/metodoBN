"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./refeicoes.module.css";

import PatientShell from "@/components/organisms/PatientShell/PatientShell";
import Icon from "@/components/atoms/Icon/Icon";
import MacroSummary from "@/components/molecules/MacroSummary/MacroSummary";
import AddFoodSheet from "@/components/molecules/AddFoodSheet/AddFoodSheet";
import Skeleton from "@/components/atoms/Skeleton/Skeleton";
import EmptyState from "@/components/molecules/EmptyState/EmptyState";
import { apiGet, apiPut, apiPost, apiDelete } from "@/lib/api";

const THRESH = 50;
const todayISO = () => new Date().toISOString().slice(0, 10);
const num = (v) => Math.round(Number(v) || 0);

function splitSub(s) {
  const [a, ...b] = (s || "").split("—");
  return { name: (a || "").trim(), qty: (b.join("—") || "").trim() };
}

function FoodRow({ food, value, onSet, onSwap }) {
  const consumido = value === "ok" || typeof value === "number";
  const swapped = typeof value === "number";
  const skipped = value === "skip";
  const hasSubs = food.subs && food.subs.length > 0;
  const chosen = swapped ? splitSub(food.subs[value - 1]) : null;
  const name = swapped ? chosen.name : food.name;
  const qty = skipped ? "não consumido" : swapped ? chosen.qty : food.qty;
  const dotClass = skipped ? styles.dotSkip : consumido ? styles.dotOk : styles.dotPend;

  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(null);
  const dxRef = useRef(0);

  function down(e) {
    startX.current = e.clientX;
    dxRef.current = 0;
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignora */
    }
  }
  function move(e) {
    if (startX.current == null) return;
    const d = Math.max(-110, Math.min(110, e.clientX - startX.current));
    dxRef.current = d;
    setDx(d);
  }
  function end() {
    if (startX.current == null) return;
    const d = dxRef.current;
    if (d >= THRESH) onSet("ok");
    else if (d <= -THRESH) onSet("skip");
    setDx(0);
    dxRef.current = 0;
    setDragging(false);
    startX.current = null;
  }

  return (
    <div className={styles.swipe}>
      <div className={styles.swipeBg}>
        <span className={styles.swipeComi}>
          <Icon name="check" size={14} strokeWidth={2.6} /> Consumi
        </span>
        <span className={styles.swipeNao}>
          Não consumi <Icon name="close" size={14} strokeWidth={2.6} />
        </span>
      </div>
      <div
        className={`${styles.food} ${dragging ? styles.dragging : ""}`}
        style={{ "--dx": `${dx}px` }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
      >
        <span className={`${styles.dot} ${dotClass}`} />
        <span className={styles.foodText}>
          <span className={`${styles.foodName} ${consumido ? styles.nameOk : ""} ${skipped ? styles.struck : ""}`}>
            {name}
            {swapped && <span className={styles.tagMini}>trocado</span>}
          </span>
          <span className={styles.foodQty}>{qty}</span>
        </span>
        {consumido && (
          <span key={String(value)} className={styles.pop}>
            <Icon name="check" size={14} strokeWidth={3} />
          </span>
        )}
        {hasSubs && !skipped && (
          <button type="button" className={styles.swapMini} onPointerDown={(e) => e.stopPropagation()} onClick={onSwap} aria-label="Trocar">
            <Icon name="swap" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function mapPlan(dp) {
  return {
    totals: { kcal: num(dp.targetKcal), c: num(dp.targetCarbsG), p: num(dp.targetProteinG), l: num(dp.targetFatG) },
    meals: (dp.meals || []).map((m) => ({
      id: m.id,
      time: (m.preferredTime || "").slice(0, 5),
      name: m.name,
      kcal: num(m.kcal),
      macros: { c: num(m.carbsG), p: num(m.proteinG), l: num(m.fatG) },
      foods: (m.items || []).map((it) => ({
        id: it.id,
        name: it.customFoodName || (it.food && it.food.name) || "Alimento",
        qty: it.quantityLabel || `${num(it.quantity)}${it.unit || ""}`,
        subs: (it.substitutions || []).map((s) => (s && s.name ? `${s.name}${s.qty ? ` — ${s.qty}` : ""}` : String(s))),
      })),
    })),
  };
}

export default function RefeicoesPage() {
  const [pid, setPid] = useState(null);
  const [plan, setPlan] = useState(undefined); // undefined=carregando, null=sem plano
  const [log, setLog] = useState({}); // { [itemId]: "ok" | number | "skip" }
  const [extras, setExtras] = useState({}); // { [mealId]: [{id,name,grams,kcal,c,p,l}] }
  const [swapModal, setSwapModal] = useState(null); // food | null
  const [addSheet, setAddSheet] = useState(null); // mealId | null

  useEffect(() => {
    let active = true;
    (async () => {
      // perfil
      let id = null;
      try {
        id = localStorage.getItem("bn_profile_id");
      } catch {
        /* ignora */
      }
      if (!id) {
        try {
          const p = await apiGet("/users/me/profile");
          id = p && p.id;
          if (id) localStorage.setItem("bn_profile_id", id);
        } catch {
          /* ignora */
        }
      }
      if (active) setPid(id);

      // plano aprovado
      let mapped = null;
      try {
        const plans = await apiGet("/diet-plans");
        if (Array.isArray(plans) && plans.length) {
          const full = await apiGet(`/diet-plans/${plans[0].id}`);
          mapped = mapPlan(full);
        }
      } catch {
        /* sem plano */
      }
      if (!active) return;
      setPlan(mapped);
      if (!mapped) return;

      // meal-logs de hoje
      if (id) {
        try {
          const data = await apiGet(`/meal-logs?patientProfileId=${id}&date=${todayISO()}`);
          if (!active) return;
          const itemMap = {};
          mapped.meals.forEach((m) => m.foods.forEach((f) => (itemMap[f.id] = f)));
          const lg = {};
          (data.logs || []).forEach((row) => {
            if (row.status === "consumed") lg[row.mealItemId] = "ok";
            else if (row.status === "skipped") lg[row.mealItemId] = "skip";
            else if (row.status === "swapped") {
              const f = itemMap[row.mealItemId];
              let idx = -1;
              if (f && row.swappedFoodName) {
                idx = f.subs.findIndex((s) => splitSub(s).name.toLowerCase() === String(row.swappedFoodName).toLowerCase());
              }
              lg[row.mealItemId] = idx >= 0 ? idx + 1 : "ok";
            }
          });
          const ex = {};
          (data.extras || []).forEach((e) => {
            const mid = e.mealId || "_";
            if (!ex[mid]) ex[mid] = [];
            ex[mid].push({ id: e.id, name: e.foodName, grams: num(e.quantityG), kcal: num(e.kcal), c: num(e.carbsG), p: num(e.proteinG), l: num(e.fatG) });
          });
          setLog(lg);
          setExtras(ex);
        } catch {
          /* sem registros */
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const meals = plan && plan.meals ? plan.meals : [];
  const foodById = (itemId) => {
    for (const m of meals) for (const f of m.foods) if (f.id === itemId) return f;
    return null;
  };

  function setFood(itemId, value) {
    setLog((p) => ({ ...p, [itemId]: value }));
    if (!pid) return;
    const date = todayISO();
    if (value === "ok") {
      apiPut(`/meal-logs/items/${itemId}`, { patientProfileId: pid, date, status: "consumed" }).catch(() => {});
    } else if (value === "skip") {
      apiPut(`/meal-logs/items/${itemId}`, { patientProfileId: pid, date, status: "skipped" }).catch(() => {});
    } else if (typeof value === "number") {
      const f = foodById(itemId);
      const swappedFoodName = f ? splitSub(f.subs[value - 1]).name : undefined;
      apiPut(`/meal-logs/items/${itemId}`, { patientProfileId: pid, date, status: "swapped", swappedFoodName }).catch(() => {});
    }
  }

  async function addExtra(mealId, extra) {
    setAddSheet(null);
    if (!pid) return;
    try {
      const created = await apiPost("/meal-logs/extras", {
        patientProfileId: pid,
        date: todayISO(),
        mealId,
        foodName: extra.name,
        quantityG: extra.grams,
        kcal: extra.kcal,
        carbsG: extra.c,
        proteinG: extra.p,
        fatG: extra.l,
      });
      setExtras((p) => ({ ...p, [mealId]: [...(p[mealId] || []), { id: created && created.id, ...extra }] }));
    } catch {
      /* ignora */
    }
  }
  function removeExtra(mealId, extraId) {
    setExtras((p) => ({ ...p, [mealId]: (p[mealId] || []).filter((e) => e.id !== extraId) }));
    if (extraId && pid) apiDelete(`/meal-logs/extras/${extraId}?patientProfileId=${pid}`).catch(() => {});
  }

  // consumo (ao vivo)
  let kcal = 0;
  let c = 0;
  let p = 0;
  let l = 0;
  meals.forEach((m) => {
    const cnt = m.foods.filter((f) => log[f.id] === "ok" || typeof log[f.id] === "number").length;
    if (cnt > 0 && m.foods.length) {
      const frac = cnt / m.foods.length;
      kcal += m.kcal * frac;
      c += m.macros.c * frac;
      p += m.macros.p * frac;
      l += m.macros.l * frac;
    }
    (extras[m.id] || []).forEach((e) => {
      kcal += e.kcal;
      c += e.c;
      p += e.p;
      l += e.l;
    });
  });
  const consumed = { kcal: Math.round(kcal), c: Math.round(c), p: Math.round(p), l: Math.round(l) };

  // ---------- loading / sem plano ----------
  if (plan === undefined) {
    return (
      <PatientShell active="refeicoes" title="Minhas refeições">
        <div className={styles.tracker}>
          <Skeleton width="100%" height={150} radius="var(--radius-lg)" />
        </div>
        <div className={styles.meals}>
          <Skeleton width="100%" height={120} radius="var(--radius-lg)" />
          <Skeleton width="100%" height={120} radius="var(--radius-lg)" />
        </div>
      </PatientShell>
    );
  }
  if (plan === null) {
    return (
      <PatientShell active="refeicoes" title="Minhas refeições">
        <EmptyState
          fruit="salada"
          title="Plano ainda não liberado"
          message="Quando a sua nutricionista liberar o plano alimentar, suas refeições aparecem aqui para você acompanhar."
        />
      </PatientShell>
    );
  }

  return (
    <PatientShell active="refeicoes" title="Minhas refeições" subtitle="Arraste → consumi · ← não consumi">
      <div className={styles.tracker}>
        <MacroSummary totals={plan.totals} consumed={consumed} />
      </div>

      <div className={styles.meals}>
        {meals.map((meal) => (
          <div key={meal.id} className={styles.meal}>
            <div className={styles.mealHead}>
              {meal.time && <span className={styles.mealTime}>{meal.time}</span>}
              <span className={styles.mealName}>{meal.name}</span>
            </div>

            <div className={styles.foods}>
              {meal.foods.map((f) => (
                <FoodRow key={f.id} food={f} value={log[f.id]} onSet={(val) => setFood(f.id, val)} onSwap={() => setSwapModal(f)} />
              ))}
            </div>

            <div className={styles.extras}>
              {(extras[meal.id] || []).map((e) => (
                <div key={e.id} className={styles.extra}>
                  <span className={styles.extraDot} />
                  <span className={styles.foodText}>
                    <span className={styles.foodName}>
                      {e.name}
                      <span className={styles.tagMore}>a mais</span>
                    </span>
                    <span className={styles.foodQty}>
                      {e.grams}g · {e.kcal} kcal
                    </span>
                  </span>
                  <button type="button" className={styles.swapMini} onClick={() => removeExtra(meal.id, e.id)} aria-label="Remover">
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className={styles.addExtra} onClick={() => setAddSheet(meal.id)}>
                <Icon name="plus" size={16} /> Adicionar algo a mais
              </button>
            </div>

            <div className={styles.mealMacros}>
              <span className={styles.mm}>
                <Icon name="flame" size={13} /> {meal.kcal} kcal
              </span>
              <span className={styles.mm}>
                <b className={styles.mmC}>C</b> {meal.macros.c}g
              </span>
              <span className={styles.mm}>
                <b className={styles.mmP}>P</b> {meal.macros.p}g
              </span>
              <span className={styles.mm}>
                <b className={styles.mmL}>G</b> {meal.macros.l}g
              </span>
            </div>
          </div>
        ))}
      </div>

      {swapModal &&
        (() => {
          const f = swapModal;
          const cur = log[f.id];
          const pick = (val) => {
            setFood(f.id, val);
            setSwapModal(null);
          };
          return (
            <div className={styles.overlay} onClick={() => setSwapModal(null)}>
              <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
                <span className={styles.handle} />
                <h3 className={styles.sheetTitle}>{f.name}</h3>
                <p className={styles.sheetSub}>O que você consumiu?</p>
                <div className={styles.options}>
                  <button type="button" className={`${styles.option} ${cur === "ok" ? styles.optionOn : ""}`} onClick={() => pick("ok")}>
                    <span className={styles.radio} />
                    <span className={styles.optText}>
                      <span className={styles.optName}>Como no plano</span>
                      <span className={styles.optQty}>
                        {f.name} · {f.qty}
                      </span>
                    </span>
                  </button>
                  {f.subs.map((s, j) => {
                    const sj = splitSub(s);
                    return (
                      <button key={j} type="button" className={`${styles.option} ${cur === j + 1 ? styles.optionOn : ""}`} onClick={() => pick(j + 1)}>
                        <span className={styles.radio} />
                        <span className={styles.optText}>
                          <span className={styles.optName}>{sj.name}</span>
                          <span className={styles.optQty}>{sj.qty}</span>
                        </span>
                      </button>
                    );
                  })}
                  <button type="button" className={`${styles.option} ${styles.optionDanger} ${cur === "skip" ? styles.optionOn : ""}`} onClick={() => pick("skip")}>
                    <span className={styles.radio} />
                    <span className={styles.optText}>
                      <span className={styles.optName}>Não consumi</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {addSheet && (
        <AddFoodSheet
          mealName={(meals.find((m) => m.id === addSheet) || {}).name}
          onAdd={(extra) => addExtra(addSheet, extra)}
          onClose={() => setAddSheet(null)}
        />
      )}
    </PatientShell>
  );
}
