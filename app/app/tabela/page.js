"use client";

import { useEffect, useState } from "react";
import styles from "./tabela.module.css";

import PatientShell from "@/components/organisms/PatientShell/PatientShell";
import Icon from "@/components/atoms/Icon/Icon";
import Spinner from "@/components/atoms/Spinner/Spinner";
import { apiGet } from "@/lib/api";

function val(v, suffix = " g") {
  if (v == null || v === "" || Number.isNaN(Number(v))) return "—";
  return `${Math.round(Number(v) * 10) / 10}${suffix}`;
}

function Macro({ label, value, kind }) {
  return (
    <div className={styles.macro}>
      <span className={`${styles.macroDot} ${styles[`k_${kind}`]}`} />
      <span className={styles.macroLabel}>{label}</span>
      <span className={styles.macroVal}>{value}</span>
    </div>
  );
}

export default function TabelaPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null); // null = carregando
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const term = q.trim();
    let active = true;

    // sem busca → mostra os populares (lista padrão)
    if (term.length < 2) {
      setLoading(true);
      setError(false);
      apiGet("/foods/popular")
        .then((items) => active && (setResults(Array.isArray(items) ? items : []), setLoading(false)))
        .catch(() => active && (setResults([]), setLoading(false)));
      return () => {
        active = false;
      };
    }

    // busca com debounce
    setLoading(true);
    setError(false);
    const t = setTimeout(async () => {
      try {
        const items = await apiGet(`/foods?q=${encodeURIComponent(term)}&limit=40`);
        if (!active) return;
        setResults(Array.isArray(items) ? items : []);
        setLoading(false);
      } catch {
        if (!active) return;
        setError(true);
        setLoading(false);
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q]);

  const searching = q.trim().length >= 2;
  const list = results || [];

  return (
    <PatientShell active="" title="Tabela nutricional" subtitle="Valores por 100 g · TACO (UNICAMP)">
      <div className={styles.search}>
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar alimento… ex.: arroz, banana, feijão" autoFocus />
        {q && (
          <button type="button" className={styles.clear} onClick={() => setQ("")} aria-label="Limpar">
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      {!searching && !loading && list.length > 0 && <span className={styles.hint}>Mais buscados</span>}

      {loading && (
        <div className={styles.state}>
          <Spinner size="md" />
          <p>{searching ? "Buscando…" : "Carregando alimentos…"}</p>
        </div>
      )}
      {!loading && error && (
        <div className={styles.state}>
          <p>Não consegui buscar agora. Confira a conexão e tente de novo.</p>
        </div>
      )}
      {!loading && !error && searching && list.length === 0 && (
        <div className={styles.state}>
          <span className={styles.stateIcon}>
            <Icon name="apple" size={30} />
          </span>
          <p>Nada encontrado para “{q}”.</p>
        </div>
      )}

      <div className={styles.results}>
        {!loading &&
          list.map((f) => (
            <div key={f.id} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.thumbFallback}>
                  <Icon name="utensils" size={18} />
                </span>
                <span className={styles.cardText}>
                  <span className={styles.cardName}>{f.name}</span>
                  {f.category && <span className={styles.cardBrand}>{f.category}</span>}
                </span>
                {f.source && <span className={styles.sourceBadge}>{f.source}</span>}
              </div>
              <div className={styles.macros}>
                <Macro label="Energia" value={val(f.kcal, " kcal")} kind="kcal" />
                <Macro label="Carboidrato" value={val(f.carbsG)} kind="c" />
                <Macro label="Proteína" value={val(f.proteinG)} kind="p" />
                <Macro label="Gordura" value={val(f.fatG)} kind="l" />
                <Macro label="Fibra" value={val(f.fiberG)} kind="f" />
                <Macro label="Sódio" value={val(f.sodiumMg, " mg")} kind="s" />
              </div>
            </div>
          ))}
      </div>

      {!loading && list.length > 0 && <p className={styles.source}>Fonte: TACO — Tabela Brasileira de Composição de Alimentos (UNICAMP)</p>}
    </PatientShell>
  );
}
