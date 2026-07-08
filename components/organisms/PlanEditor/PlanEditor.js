"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/atoms/Icon/Icon";
import Skeleton from "@/components/atoms/Skeleton/Skeleton";
import FoodItemModal from "@/components/organisms/FoodItemModal/FoodItemModal";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import styles from "./PlanEditor.module.css";

const r0 = (v) => Math.round(Number(v) || 0);

function itemName(it) {
  return it.customFoodName || (it.food && it.food.name) || "Alimento";
}

export default function PlanEditor({ patientProfileId, onPlanChange }) {
  const [plan, setPlan] = useState(undefined); // undefined=carregando, null=sem plano, obj=plano
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null); // { mode:'add'|'edit', mealId, item? }

  async function load() {
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
      await load();
    } catch {
      /* ignora */
    } finally {
      setBusy(false);
    }
  }
  async function patchMeal(mealId, data) {
    try {
      await apiPatch(`/diet-plans/meals/${mealId}`, data);
      await load();
    } catch {
      /* ignora */
    }
  }
  async function removeMeal(mealId) {
    try {
      await apiDelete(`/diet-plans/meals/${mealId}`);
      await load();
    } catch {
      /* ignora */
    }
  }
  async function removeItem(itemId) {
    try {
      await apiDelete(`/diet-plans/items/${itemId}`);
      await load();
    } catch {
      /* ignora */
    }
  }
  async function approve() {
    if (!plan) return;
    setBusy(true);
    try {
      await apiPost(`/diet-plans/${plan.id}/approve`, {});
      await load();
    } catch {
      /* ignora */
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveItem(data) {
    if (!modal) return;
    try {
      if (modal.mode === "add") await apiPost(`/diet-plans/meals/${modal.mealId}/items`, data);
      else await apiPatch(`/diet-plans/items/${modal.item.id}`, data);
      setModal(null);
      await load();
    } catch {
      /* ignora */
    }
  }
  async function handleRemoveModalItem() {
    if (!modal || modal.mode !== "edit") return;
    try {
      await apiDelete(`/diet-plans/items/${modal.item.id}`);
      setModal(null);
      await load();
    } catch {
      /* ignora */
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
                <button type="button" className={styles.itemMain} onClick={() => setModal({ mode: "edit", mealId: m.id, item: it })}>
                  <span className={styles.itemText}>
                    <span className={styles.itemName}>{itemName(it)}</span>
                    <span className={styles.itemSub}>
                      {it.quantityLabel || `${r0(it.quantity)} g`}
                      {it.substitutions && it.substitutions.length ? ` · ${it.substitutions.length} troca${it.substitutions.length > 1 ? "s" : ""}` : ""}
                    </span>
                  </span>
                  <span className={styles.itemKcal}>{r0(it.kcal)} kcal</span>
                  <Icon name="chevronRight" size={16} />
                </button>
                <button type="button" className={styles.iconBtn} onClick={() => removeItem(it.id)} aria-label="Remover item">
                  <Icon name="close" size={15} />
                </button>
              </div>
            ))}

            <button type="button" className={styles.addItemBtn} onClick={() => setModal({ mode: "add", mealId: m.id })}>
              <Icon name="plus" size={15} /> Adicionar alimento
            </button>

            <div className={styles.mealMacros}>
              <b>{r0(m.kcal)}</b> kcal · C {r0(m.carbsG)}g · P {r0(m.proteinG)}g · G {r0(m.fatG)}g
            </div>
          </div>
        );
      })}

      <button type="button" className={styles.addMealBtn} disabled={busy} onClick={addMeal}>
        <Icon name="plus" size={18} /> Adicionar refeição
      </button>

      {modal && (
        <FoodItemModal
          initial={
            modal.mode === "edit"
              ? {
                  itemId: modal.item.id,
                  name: itemName(modal.item),
                  foodId: modal.item.foodId,
                  quantity: modal.item.quantity,
                  kcal: modal.item.kcal,
                  substitutions: modal.item.substitutions,
                }
              : null
          }
          onSave={handleSaveItem}
          onRemove={handleRemoveModalItem}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
