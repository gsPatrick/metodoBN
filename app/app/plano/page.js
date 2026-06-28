"use client";

import { useEffect, useState } from "react";
import PatientShell from "@/components/organisms/PatientShell/PatientShell";
import PlanoView from "@/components/organisms/PlanoView/PlanoView";
import { PLAN } from "@/data/plan";

export default function PlanoPacientePage() {
  const [consumed, setConsumed] = useState({ kcal: 0, c: 0, p: 0, l: 0 });

  useEffect(() => {
    let log = {};
    try {
      log = JSON.parse(localStorage.getItem("bn_refeicoes_me") || "{}");
    } catch {
      /* ignora */
    }
    let kcal = 0;
    let c = 0;
    let p = 0;
    let l = 0;
    PLAN.meals.forEach((m) => {
      const ml = log[m.time] || {};
      const consumed = m.foods.filter((_, i) => ml[i] === "ok" || typeof ml[i] === "number").length;
      if (consumed <= 0) return;
      const frac = consumed / m.foods.length;
      kcal += m.kcal * frac;
      c += m.macros.c * frac;
      p += m.macros.p * frac;
      l += m.macros.l * frac;
    });
    setConsumed({ kcal: Math.round(kcal), c: Math.round(c), p: Math.round(p), l: Math.round(l) });
  }, []);

  return (
    <PatientShell active="plano" title="Plano alimentar" subtitle="Consumo de hoje, cardápio e receitas">
      <PlanoView plan={PLAN} patientId="me" tabs={["refeicoes", "receitas"]} consumed={consumed} />
    </PatientShell>
  );
}
