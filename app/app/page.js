"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";

import PatientShell from "@/components/organisms/PatientShell/PatientShell";
import Icon from "@/components/atoms/Icon/Icon";
import Fruit from "@/components/atoms/Fruit/Fruit";
import ScoreGauge from "@/components/molecules/ScoreGauge/ScoreGauge";
import Skeleton from "@/components/atoms/Skeleton/Skeleton";
import { scoreOf, WATER_GOAL_ML, waterGoal } from "@/data/habits";
import { apiGet, getCurrentUser, isLoggedIn } from "@/lib/api";

const BANNERS = [
  { tag: "Seu plano", title: "Cardápio de hoje", btn: "Ver plano", href: "/app/plano", fruit: "salada", grad: "gradA" },
  { tag: "Receita", title: "Receitas sem lactose", btn: "Ver receitas", href: "/app/plano", fruit: "banana", grad: "gradB" },
  { tag: "Compras", title: "Lista da semana", btn: "Ver lista", href: "/app/compras", fruit: "laranja", grad: "gradC" }
];
const todayISO = () => new Date().toISOString().slice(0, 10);

export default function HomePage() {
  const router = useRouter();
  const carRef = useRef(null);
  const [active, setActive] = useState(0);
  const [first, setFirst] = useState("");
  const [h, setH] = useState(null); // null = carregando
  const [goal, setGoal] = useState(WATER_GOAL_ML);
  const [recipes, setRecipes] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    const u = getCurrentUser();
    setFirst(u && u.name ? u.name.trim().split(/\s+/)[0] : "");

    let active = true;
    (async () => {
      let pid = null;
      try {
        const profile = await apiGet("/users/me/profile");
        pid = profile && profile.id;
        if (active && profile) setGoal(waterGoal(profile.weightKg));
        if (pid) {
          try {
            localStorage.setItem("bn_profile_id", pid);
          } catch {
            /* ignora */
          }
        }
      } catch {
        /* sem perfil */
      }

      // hábitos de hoje (gamificação)
      if (pid) {
        try {
          const m = await apiGet(`/health-metrics/${todayISO()}?patientProfileId=${pid}`);
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

      // receitas do plano (aprovado)
      try {
        const plans = await apiGet("/diet-plans");
        if (active && Array.isArray(plans) && plans.length) {
          const full = await apiGet(`/diet-plans/${plans[0].id}`);
          if (active) setRecipes((full.recipes || []).map((r) => ({ name: r.name, yield: r.yield })));
        } else if (active) {
          setRecipes([]);
        }
      } catch {
        if (active) setRecipes([]);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = h ? scoreOf(h, goal) : 0;

  function onScroll() {
    const el = carRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / (el.scrollWidth / BANNERS.length)));
  }

  return (
    <PatientShell
      active="home"
      title="Início"
      subtitle={first ? `Olá, ${first} 👋` : "Olá 👋"}
      headerRight={
        <button type="button" className={styles.avatarBtn} onClick={() => router.push("/app/ajustes")} aria-label="Perfil e ajustes">
          {first ? first[0] : "•"}
        </button>
      }
    >
      <div className={styles.greet}>
        <h1 className={styles.greetTitle}>
          Olá, <em>{first || "…"}</em> 👋
        </h1>
        <p className={styles.greetSub}>Bora cuidar de você hoje?</p>
      </div>

      {h === null ? (
        <div className={styles.scoreCard}>
          <Skeleton circle width={104} height={104} />
          <Skeleton width="70%" height={28} radius="var(--radius-pill)" />
        </div>
      ) : (
        <button type="button" className={styles.scoreCard} onClick={() => router.push("/app/habitos")}>
          <ScoreGauge score={score} />
          <div className={styles.habitChips}>
            <span className={`${styles.hchip} ${h.treino ? styles.hchipOn : ""}`}>
              <Icon name="dumbbell" size={14} /> Treino
            </span>
            <span className={`${styles.hchip} ${h.sono ? styles.hchipOn : ""}`}>
              <Icon name="moon" size={14} /> Sono
            </span>
            <span className={`${styles.hchip} ${h.agua >= goal ? styles.hchipOn : ""}`}>
              <Icon name="water" size={14} /> Água
            </span>
          </div>
        </button>
      )}

      <div className={styles.carousel} ref={carRef} onScroll={onScroll}>
        {BANNERS.map((b) => (
          <button key={b.tag} type="button" className={`${styles.banner} ${styles[b.grad]}`} onClick={() => router.push(b.href)}>
            <Fruit name={b.fruit} fallback="apple" size={84} className={styles.bannerFruit} />
            <span className={styles.bannerTag}>{b.tag}</span>
            <span className={styles.bannerTitle}>{b.title}</span>
            <span className={styles.bannerBtn}>
              {b.btn} <Icon name="arrowRight" size={15} />
            </span>
          </button>
        ))}
      </div>
      <div className={styles.dots}>
        {BANNERS.map((_, i) => (
          <span key={i} className={`${styles.dot} ${i === active ? styles.dotOn : ""}`} />
        ))}
      </div>

      <button type="button" className={styles.feature} onClick={() => router.push("/app/refeicoes")}>
        <span className={styles.featureText}>
          <span className={styles.featureTitle}>Já registrou suas refeições?</span>
          <span className={styles.featureSub}>Marque trocas e o que não comeu.</span>
        </span>
        <span className={styles.featureBtn}>Marcar</span>
      </button>

      <button type="button" className={styles.tabela} onClick={() => router.push("/app/tabela")}>
        <span className={styles.tabelaIcon}>
          <Icon name="chart" size={22} />
        </span>
        <span className={styles.tabelaText}>
          <span className={styles.tabelaTitle}>Tabela nutricional</span>
          <span className={styles.tabelaSub}>Veja os valores de qualquer alimento em tempo real</span>
        </span>
        <Icon name="arrowRight" size={18} />
      </button>

      <div className={styles.tip}>
        <span className={styles.tipIcon}>
          <Icon name="water" size={22} />
        </span>
        <span className={styles.tipText}>
          <span className={styles.tipLabel}>Dica do dia</span>
          <span className={styles.tipBody}>Beba um copo de água antes das refeições — ajuda na saciedade e na digestão.</span>
        </span>
      </div>

      {recipes === null ? (
        <>
          <div className={styles.secRow}>
            <span className={styles.secLabel}>Receitas do seu plano</span>
          </div>
          <div className={styles.recipes}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.recipe}>
                <Skeleton width="100%" height={64} radius="var(--radius-md)" />
              </div>
            ))}
          </div>
        </>
      ) : recipes.length > 0 ? (
        <>
          <div className={styles.secRow}>
            <span className={styles.secLabel}>Receitas do seu plano</span>
            <button type="button" className={styles.seeAll} onClick={() => router.push("/app/plano")}>
              Ver todas
            </button>
          </div>
          <div className={styles.recipes}>
            {recipes.slice(0, 6).map((r, i) => (
              <button key={i} type="button" className={styles.recipe} onClick={() => router.push("/app/plano")}>
                <span className={styles.recipeIcon}>
                  <Icon name="utensils" size={20} />
                </span>
                <span className={styles.recipeName}>{r.name}</span>
                <span className={styles.recipeYield}>{r.yield}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={styles.secRow}>
            <span className={styles.secLabel}>Receitas do seu plano</span>
          </div>
          <div className={styles.recipesEmpty}>
            <Icon name="utensils" size={20} />
            <span>Suas receitas aparecem aqui quando a nutri liberar seu plano alimentar.</span>
          </div>
        </>
      )}
    </PatientShell>
  );
}
