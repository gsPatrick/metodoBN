"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./PatientShell.module.css";
import Icon from "@/components/atoms/Icon/Icon";
import { apiGet, apiPost, apiPut, getProfileId } from "@/lib/api";

const todayISO = () => new Date().toISOString().slice(0, 10);

// reduz a foto antes de enviar (evita estourar o limite do servidor)
function compressImage(dataUrl, maxDim = 1000, quality = 0.7) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const r = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}

const NAV = [
  { key: "home", label: "Início", icon: "home", href: "/app" },
  { key: "refeicoes", label: "Refeições", icon: "utensils", href: "/app/refeicoes" },
  { key: "compras", label: "Compras", icon: "cart", href: "/app/compras" },
  { key: "chat", label: "Chat", icon: "chat", href: "/app/chat" }
];

export default function PatientShell({ active, title, subtitle, headerRight, fill = false, hideHeader = false, children }) {
  const router = useRouter();
  const [cam, setCam] = useState(null); // null | { phase, src, meal }
  const [plan, setPlan] = useState(null); // { meals:[{id,time,name,foods:[{id}]}] } | { meals: [] }
  const [sending, setSending] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [theme, setTheme] = useState("dark");
  const camInput = useRef(null);
  const galInput = useRef(null);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("bn_app_theme");
      if (t === "light" || t === "dark") setTheme(t);
    } catch {
      /* ignora */
    }
    function onTheme(e) {
      if (e.detail === "light" || e.detail === "dark") setTheme(e.detail);
    }
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY.current && y > 80) setHidden(true);
        else if (y < lastY.current) setHidden(false);
        lastY.current = y;
        ticking.current = false;
      });
    }
    window.addEventListener("bn-app-theme", onTheme);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("bn-app-theme", onTheme);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  async function ensurePlan() {
    if (plan) return plan;
    let mapped = { meals: [] };
    try {
      const plans = await apiGet("/diet-plans");
      if (Array.isArray(plans) && plans.length) {
        const full = await apiGet(`/diet-plans/${plans[0].id}`);
        mapped = {
          meals: (full.meals || []).map((m) => ({
            id: m.id,
            time: (m.preferredTime || "").slice(0, 5),
            name: m.name,
            foods: (m.items || []).map((it) => ({ id: it.id })),
          })),
        };
      }
    } catch {
      /* sem plano */
    }
    setPlan(mapped);
    return mapped;
  }

  function openCam() {
    setCam({ phase: "pick", src: null, meal: null });
    ensurePlan();
  }

  function onPick(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = async () => {
      const compressed = await compressImage(String(r.result));
      setCam((c) => ({ ...(c || {}), phase: "preview", src: compressed, meal: c ? c.meal : null }));
    };
    r.readAsDataURL(f);
    e.target.value = "";
  }

  async function send() {
    if (!cam || !cam.src || !cam.meal || sending) return;
    setSending(true);
    const mealObj = (plan && plan.meals ? plan.meals : []).find((x) => x.name === cam.meal);
    try {
      const pid = await getProfileId();
      if (pid) {
        // envia a foto pra nutri no chat
        const conv = await apiPost("/conversations", { patientProfileId: pid });
        if (conv && conv.id) {
          await apiPost(`/conversations/${conv.id}/messages`, {
            type: "image",
            attachmentUrl: cam.src,
            attachmentName: "refeicao.jpg",
            body: `Comi: ${cam.meal}`,
          });
        }
        // marca a refeição como consumida (todos os itens)
        if (mealObj) {
          const date = todayISO();
          await Promise.all(
            (mealObj.foods || []).map((fd) =>
              apiPut(`/meal-logs/items/${fd.id}`, { patientProfileId: pid, date, status: "consumed" }).catch(() => {})
            )
          );
        }
      }
    } catch {
      /* ignora */
    }
    setSending(false);
    setCam(null);
    router.push("/app/chat");
  }

  function navItem(n) {
    return (
      <button
        key={n.key}
        type="button"
        className={`${styles.navItem} ${active === n.key ? styles.navActive : ""}`}
        onClick={() => {
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8); // haptic leve (Android)
          router.push(n.href);
        }}
        aria-current={active === n.key ? "page" : undefined}
      >
        <Icon name={n.icon} size={22} />
        <span className={styles.navLabel}>{n.label}</span>
      </button>
    );
  }

  return (
    <div className={styles.frame} data-theme={theme}>
      {!hideHeader && (
        <header className={`${styles.header} ${hidden ? styles.headerHidden : ""}`}>
          <div className={styles.headerText}>
            <span className={styles.headerTitle}>{title}</span>
            {subtitle && <span className={styles.headerSub}>{subtitle}</span>}
          </div>
          {headerRight || (
            <button type="button" className={styles.bell} aria-label="Notificações">
              <Icon name="bell" size={20} />
              <span className={styles.bellDot} />
            </button>
          )}
        </header>
      )}

      <main className={`${styles.content} ${fill ? styles.contentFill : ""}`}>{children}</main>

      <nav className={styles.nav} aria-label="Navegação">
        {navItem(NAV[0])}
        {navItem(NAV[1])}
        <button type="button" className={styles.camFab} onClick={openCam} aria-label="Registrar refeição com foto">
          <Icon name="camera" size={24} />
        </button>
        {navItem(NAV[2])}
        {navItem(NAV[3])}
      </nav>

      {cam && (
        <div className={styles.camOverlay} onClick={() => setCam(null)}>
          <div className={styles.camSheet} onClick={(e) => e.stopPropagation()}>
            <span className={styles.camHandle} />
            {cam.phase === "pick" ? (
              <>
                <h3 className={styles.camTitle}>Registrar refeição</h3>
                <p className={styles.camSub}>Tire uma foto do prato pra enviar pra sua nutri.</p>
                <button type="button" className={styles.camBig} onClick={() => camInput.current && camInput.current.click()}>
                  <Icon name="camera" size={22} /> Tirar foto
                </button>
                <button type="button" className={styles.camAlt} onClick={() => galInput.current && galInput.current.click()}>
                  <Icon name="image" size={18} /> Escolher da galeria
                </button>
              </>
            ) : (
              <>
                <h3 className={styles.camTitle}>Qual refeição?</h3>
                <img className={styles.camPreview} src={cam.src} alt="" />
                <div className={styles.camMeals}>
                  {!plan ? (
                    <span className={styles.camLoading}>Carregando suas refeições…</span>
                  ) : plan.meals.length === 0 ? (
                    <span className={styles.camLoading}>Seu plano ainda não foi liberado.</span>
                  ) : (
                    plan.meals.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`${styles.camMeal} ${cam.meal === m.name ? styles.camMealOn : ""}`}
                        onClick={() => setCam((c) => ({ ...c, meal: m.name }))}
                      >
                        {m.time ? `${m.time} · ` : ""}
                        {m.name}
                      </button>
                    ))
                  )}
                </div>
                <button type="button" className={styles.camSend} disabled={!cam.meal || sending} onClick={send}>
                  <Icon name="chat" size={18} /> {sending ? "Enviando…" : "Enviar pra nutri"}
                </button>
                <button type="button" className={styles.camAlt} onClick={() => setCam((c) => ({ ...c, phase: "pick", src: null }))}>
                  Trocar foto
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <input ref={camInput} type="file" accept="image/*" capture="environment" hidden onChange={onPick} />
      <input ref={galInput} type="file" accept="image/*" hidden onChange={onPick} />
    </div>
  );
}
