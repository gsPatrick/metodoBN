"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./compras.module.css";

import PatientShell from "@/components/organisms/PatientShell/PatientShell";
import Icon from "@/components/atoms/Icon/Icon";
import FinishFlow from "@/components/molecules/FinishFlow/FinishFlow";
import Skeleton from "@/components/atoms/Skeleton/Skeleton";
import EmptyState from "@/components/molecules/EmptyState/EmptyState";
import StreetNav from "@/components/organisms/StreetNav/StreetNav";
import { apiGet } from "@/lib/api";
import { categorizeShopping, ingredientsFromMeals } from "@/lib/shopping";

const TIPS = [
  { icon: "leaf", text: "Prefira frutas e verduras da estação — mais frescas e baratas." },
  { icon: "dumbbell", text: "Pegue proteínas e congelados por último, pra manter a temperatura." },
  { icon: "water", text: "Leve sacola reutilizável e evite ir ao mercado com fome 😉." }
];

function distKm(a, b, c, d) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(c - a);
  const dLon = toRad(d - b);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function distLabel(km) {
  if (km == null) return "";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
function osmEmbed(geo, market) {
  const pts = [[geo.lat, geo.lon]];
  if (market && market.lat != null) pts.push([market.lat, market.lon]);
  const lats = pts.map((p) => p[0]);
  const lons = pts.map((p) => p[1]);
  const pad = 0.0035;
  const minLat = Math.min(...lats) - pad;
  const maxLat = Math.max(...lats) + pad;
  const minLon = Math.min(...lons) - pad;
  const maxLon = Math.max(...lons) + pad;
  const mk = market && market.lat != null ? `${market.lat},${market.lon}` : `${geo.lat},${geo.lon}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${mk}`;
}

// Google Maps Embed (mapa com rota a pé, dentro do app)
const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "AIzaSyCfkK9FL13CpC-wNG5NHPpWXSMHYQREZQ0";
function gmapsDirections(origin, market) {
  return `https://www.google.com/maps/embed/v1/directions?key=${GMAPS_KEY}&origin=${origin.lat},${origin.lon}&destination=${market.lat},${market.lon}&mode=walking&zoom=16&maptype=satellite`;
}
function gmapsPlace(market) {
  return `https://www.google.com/maps/embed/v1/place?key=${GMAPS_KEY}&q=${market.lat},${market.lon}&zoom=16&maptype=satellite`;
}
function gmapsStreetview(market) {
  return `https://www.google.com/maps/embed/v1/streetview?key=${GMAPS_KEY}&location=${market.lat},${market.lon}&fov=80&pitch=0`;
}

// rumo (graus a partir do norte) de A para B
function bearing(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const toDeg = (x) => (x * 180) / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Mercado mais próximo via backend (Google Places) — com cache (não chama toda hora).
const MARKET_TTL = 12 * 60 * 60 * 1000; // 12h
async function findMarket(lat, lon) {
  const key = `bn_market_${lat.toFixed(3)}_${lon.toFixed(3)}`; // ~100m de granularidade
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const c = JSON.parse(raw);
      if (c && c.ts && Date.now() - c.ts < MARKET_TTL && c.m) {
        return { ...c.m, dist: distKm(lat, lon, c.m.lat, c.m.lon) };
      }
    }
  } catch {
    /* ignora cache */
  }
  try {
    const m = await apiGet(`/markets/nearest?lat=${lat}&lng=${lon}`);
    if (m && m.lat != null && m.lng != null) {
      const r = { name: m.name || "Mercado próximo", address: m.address || null, lat: m.lat, lon: m.lng };
      try {
        localStorage.setItem(key, JSON.stringify({ ts: Date.now(), m: r }));
      } catch {
        /* ignora */
      }
      return { ...r, dist: distKm(lat, lon, r.lat, r.lon) };
    }
  } catch {
    /* sem mercado / sem chave */
  }
  return null;
}

export default function ComprasPage() {
  const router = useRouter();
  const [shopping, setShopping] = useState(undefined); // undefined=carregando, null=sem plano
  const [phase, setPhase] = useState("intro"); // intro | map | list | done
  const [bought, setBought] = useState([]);
  const [extras, setExtras] = useState([]);
  const [newExtra, setNewExtra] = useState("");
  const [finished, setFinished] = useState(false);
  const [ready, setReady] = useState(false);

  const [geo, setGeo] = useState(null); // null=indef, "denied"/"unsupported", { lat, lon }
  const [market, setMarket] = useState(null); // null, "loading", { name, lat, lon, dist }
  const [navOrigin, setNavOrigin] = useState(null); // origem da rota (atualiza só ao andar)
  const [streetDist, setStreetDist] = useState(null); // distância (m) do street view guiado
  const [arrived, setArrived] = useState(false);
  const [svFailed, setSvFailed] = useState(false); // fallback p/ embed se o Street View JS falhar

  // plano → lista de compras (categorizada)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const plans = await apiGet("/diet-plans");
        if (Array.isArray(plans) && plans.length) {
          const full = await apiGet(`/diet-plans/${plans[0].id}`);
          const items =
            Array.isArray(full.shoppingItems) && full.shoppingItems.length ? full.shoppingItems : ingredientsFromMeals(full.meals);
          if (active) setShopping(categorizeShopping(items));
        } else if (active) {
          setShopping(null);
        }
      } catch {
        if (active) setShopping(null);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // localização do usuário (acompanha enquanto anda → seta/distância ao vivo)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeo("unsupported");
      return undefined;
    }
    // baixa precisão = funciona no desktop (IP/wifi) e no celular; rápido o bastante
    const id = navigator.geolocation.watchPosition(
      (pos) => setGeo({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setGeo((g) => (g && typeof g === "object" ? g : "denied")),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // origem da rota: atualiza só quando o usuário anda > ~30 m (evita recarregar o mapa toda hora)
  useEffect(() => {
    if (!geo || typeof geo !== "object") return;
    setNavOrigin((prev) => {
      if (!prev) return { lat: geo.lat, lon: geo.lon };
      if (distKm(prev.lat, prev.lon, geo.lat, geo.lon) > 0.03) return { lat: geo.lat, lon: geo.lon };
      return prev;
    });
  }, [geo]);

  // mercado mais próximo — busca UMA vez quando a localização chega.
  // (sem cancelar no cleanup: o watchPosition atualiza o geo várias vezes e
  //  cancelaria a busca em andamento, travando em "Procurando…")
  const searchedRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true; // reseta no (re)mount — importante no StrictMode (dev)
    return () => {
      mountedRef.current = false;
    };
  }, []);
  useEffect(() => {
    if (searchedRef.current || !geo || typeof geo === "string") return;
    searchedRef.current = true;
    setMarket("loading");
    findMarket(geo.lat, geo.lon)
      .then((m) => {
        if (mountedRef.current) setMarket(m || "none");
      })
      .catch(() => {
        if (mountedRef.current) setMarket("none");
      });
  }, [geo]);

  // restaura compras + fase
  useEffect(() => {
    try {
      const raw = localStorage.getItem("bn_compras_me");
      if (raw) {
        const d = JSON.parse(raw);
        setBought(d.bought || []);
        setExtras(d.extras || []);
      }
      const ph = localStorage.getItem("bn_compras_phase");
      if (ph === "map" || ph === "list") setPhase(ph);
    } catch {
      /* ignora */
    }
    setReady(true);
  }, []);

  // Troca de fase persistindo na hora: ao entrar em "comprando" (map/list),
  // sair e voltar mantém a fase até concluir.
  function goPhase(p) {
    setPhase(p);
    try {
      if (p === "map" || p === "list") localStorage.setItem("bn_compras_phase", p);
      else if (p === "intro") localStorage.removeItem("bn_compras_phase");
      // "done": não mexe — se sair durante a conclusão, volta para a lista
    } catch {
      /* ignora */
    }
  }

  function resetCompras() {
    try {
      localStorage.removeItem("bn_compras_phase");
      localStorage.removeItem("bn_compras_me");
    } catch {
      /* ignora */
    }
    router.push("/app");
  }
  function persist(b, e) {
    try {
      localStorage.setItem("bn_compras_me", JSON.stringify({ bought: b, extras: e }));
    } catch {
      /* ignora */
    }
  }
  function toggle(item) {
    setBought((prev) => {
      const next = prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item];
      persist(next, extras);
      return next;
    });
  }
  function addExtra() {
    const v = newExtra.trim();
    if (!v) return;
    setExtras((prev) => {
      const next = [...prev, v];
      persist(bought, next);
      return next;
    });
    setNewExtra("");
  }
  function removeExtra(i) {
    setExtras((prev) => {
      const next = prev.filter((_, j) => j !== i);
      persist(bought, next);
      return next;
    });
  }

  const allItems = useMemo(() => (Array.isArray(shopping) ? shopping.flatMap((g) => g.items) : []), [shopping]);
  const total = allItems.length;
  const boughtCount = allItems.filter((it) => bought.includes(it)).length;
  const pct = total ? Math.round((boughtCount / total) * 100) : 0;

  const hasMarket = market && typeof market === "object";
  const marketName = hasMarket
    ? market.name
    : market === "loading"
    ? "Procurando perto de você…"
    : market === "none"
    ? "Nenhum mercado mapeado por perto"
    : "Mercado mais próximo";
  const liveDistKm = hasMarket && typeof geo === "object" ? distKm(geo.lat, geo.lon, market.lat, market.lon) : hasMarket ? market.dist : null;
  const marketDist = liveDistKm != null ? distLabel(liveDistKm) : "";
  const heading = hasMarket && typeof geo === "object" ? bearing(geo.lat, geo.lon, market.lat, market.lon) : null;
  const routeOrigin = navOrigin || (geo && typeof geo === "object" ? { lat: geo.lat, lon: geo.lon } : null);
  const footerDist = streetDist != null ? distLabel(streetDist / 1000) : marketDist;

  function MapBox({ tall }) {
    // Navegação Google (rota a pé) dentro do app, quando há chave + mercado
    if (GMAPS_KEY && hasMarket) {
      const url = tall && navOrigin ? gmapsDirections(navOrigin, market) : gmapsPlace(market);
      return (
        <iframe
          className={tall ? styles.mapBigFrame : styles.mapFrame}
          src={url}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title="Rota até o mercado"
        />
      );
    }
    // fallback: OpenStreetMap (sem chave do Google)
    if (geo && typeof geo === "object") {
      return (
        <iframe
          className={tall ? styles.mapBigFrame : styles.mapFrame}
          src={osmEmbed(geo, typeof market === "object" ? market : null)}
          loading="lazy"
          title="Mapa do mercado mais próximo"
        />
      );
    }
    return (
      <div className={tall ? styles.bigMap : styles.mapPreview}>
        <span className={styles.mapGrid} />
        <span className={styles.geoHint}>
          {geo === "denied" ? "Ative a localização para ver o mercado mais próximo." : "Carregando o mapa…"}
        </span>
      </div>
    );
  }

  // ---------- loading / sem plano ----------
  if (shopping === undefined) {
    return (
      <PatientShell active="compras" title="Lista de compras" subtitle="Carregando…">
        <Skeleton width="100%" height={110} radius="var(--radius-lg)" />
        <div className={styles.skGap} />
        <Skeleton width="100%" height={80} radius="var(--radius-lg)" />
        <div className={styles.skGap} />
        <Skeleton width="100%" height={160} radius="var(--radius-lg)" />
      </PatientShell>
    );
  }
  if (shopping === null) {
    return (
      <PatientShell active="compras" title="Lista de compras">
        <EmptyState
          fruit="salada"
          title="Plano ainda não liberado"
          message="Quando a sua nutricionista liberar o plano, a lista de compras aparece aqui, separada por categorias."
        />
      </PatientShell>
    );
  }

  const subtitle =
    phase === "intro" ? "Antes de ir ao mercado" : phase === "map" ? "A caminho do mercado" : phase === "done" ? "Quase lá!" : `${boughtCount}/${total} no carrinho`;

  return (
    <PatientShell active="compras" title="Lista de compras" subtitle={subtitle} fill={phase === "map"} hideHeader={phase === "map"}>
      {/* ===== Intro ===== */}
      {phase === "intro" && (
        <div className={styles.intro}>
          <div className={styles.heroCard}>
            <div className={styles.heroTop}>
              <span className={styles.heroIcon}>
                <Icon name="cart" size={24} />
              </span>
              <span className={styles.heroHead}>
                <span className={styles.heroKicker}>Lista da semana</span>
                <span className={styles.heroTitle}>Tudo pra seguir seu plano 🥗</span>
              </span>
            </div>
            <div className={styles.heroStats}>
              <span className={styles.heroStat}>
                <b>{total}</b> itens
              </span>
              <span className={styles.heroDiv} />
              <span className={styles.heroStat}>
                <b>{shopping.length}</b> categorias
              </span>
            </div>
          </div>

          <span className={styles.secLabel}>O que comprar</span>
          {shopping.map((g) => (
            <div key={g.group} className={styles.buyGroup}>
              <div className={styles.buyHead}>
                <span className={styles.catIcon}>
                  <Icon name={g.icon} size={15} />
                </span>
                {g.group}
                <span className={styles.catCount}>{g.items.length}</span>
              </div>
              <div className={styles.tags}>
                {g.items.map((it) => (
                  <span key={it} className={styles.tag}>
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <span className={styles.secLabel}>Dicas</span>
          <div className={styles.tips}>
            {TIPS.map((t, i) => (
              <div key={i} className={styles.tipRow}>
                <span className={styles.tipIco}>
                  <Icon name={t.icon} size={16} />
                </span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>

          <span className={styles.secLabel}>Mercado mais próximo</span>
          {hasMarket ? (
            <div className={styles.mapCard}>
              <MapBox />
              <div className={styles.mapInfo}>
                <span className={styles.mapName}>{marketName}</span>
                {marketDist && (
                  <span className={styles.mapDist}>
                    <Icon name="activity" size={13} /> {marketDist} de você
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.marketNote}>
              <Icon name="cart" size={18} />
              <span>
                {market === "loading"
                  ? "Procurando o mercado mais próximo de você…"
                  : geo === "denied"
                  ? "Ative a localização para ver o mercado mais próximo."
                  : "Nenhum mercado mapeado por perto."}
              </span>
            </div>
          )}

          <button type="button" className={styles.startBtn} onClick={() => goPhase("map")}>
            Começar a comprar <Icon name="arrowRight" size={18} />
          </button>
        </div>
      )}

      {/* ===== Navegação (mapa cobre tudo + rodapé) ===== */}
      {phase === "map" && (
        <div className={styles.navFull}>
          <div className={styles.streetWrap}>
            {hasMarket && routeOrigin ? (
              svFailed ? (
                <div className={styles.mapFull}>
                  <div className={styles.mapPane}>
                    <iframe
                      className={styles.paneFrame}
                      src={gmapsDirections(routeOrigin, market)}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Rota até o mercado"
                    />
                    <span className={styles.paneTag}>Rota</span>
                  </div>
                  <div className={styles.mapPane}>
                    <iframe
                      className={styles.paneFrame}
                      src={gmapsStreetview(market)}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Street View do mercado"
                    />
                    <span className={styles.paneTag}>Street View</span>
                  </div>
                </div>
              ) : (
                <>
                  <StreetNav
                    key={`${market.lat},${market.lon}`}
                    start={routeOrigin}
                    dest={market}
                    onProgress={(d) => setStreetDist(d)}
                    onArrive={() => setArrived(true)}
                    onFail={() => setSvFailed(true)}
                  />
                  <span className={styles.streetTag}>{arrived ? "Você chegou! 🎉" : "Street View"}</span>
                </>
              )
            ) : (
              <div className={styles.marketNote}>
                <Icon name="cart" size={18} />
                <span>
                  {market === "loading"
                    ? "Procurando o mercado mais próximo…"
                    : geo === "denied"
                    ? "Ative a localização para encontrar o mercado."
                    : "Nenhum mercado mapeado por perto — siga para o mercado da sua preferência."}
                </span>
              </div>
            )}
          </div>
          <div className={styles.navCard}>
            <span className={styles.navTo}>A caminho de</span>
            <span className={styles.navStore}>{marketName}</span>
            {footerDist ? (
              <span className={styles.navMeta}>
                <Icon name="activity" size={14} /> {footerDist} de você
              </span>
            ) : market === "none" ? (
              <span className={styles.navMeta}>Siga para o mercado da sua preferência</span>
            ) : null}
            <button type="button" className={styles.startBtn} onClick={() => goPhase("list")}>
              <Icon name="check" size={18} /> Já cheguei no lugar
            </button>
            <button type="button" className={styles.backLink} onClick={() => goPhase("intro")}>
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* ===== Lista ===== */}
      {phase === "list" && (
        <div className={styles.list}>
          <div className={styles.progress}>
            <span className={styles.progressText}>
              {boughtCount} de {total} comprados
            </span>
            <div className={styles.bar}>
              <span className={styles.barFill} style={{ "--w": `${pct}%` }} />
            </div>
          </div>

          {shopping.map((g) => (
            <div key={g.group} className={styles.group}>
              <h4 className={styles.groupTitle}>
                <Icon name={g.icon} size={16} /> {g.group}
              </h4>
              {g.items.map((it) => {
                const done = bought.includes(it);
                return (
                  <button key={it} type="button" className={`${styles.item} ${done ? styles.itemDone : ""}`} onClick={() => toggle(it)}>
                    <span className={styles.check}>{done && <Icon name="check" size={13} strokeWidth={3} />}</span>
                    <span className={styles.itemName}>{it}</span>
                  </button>
                );
              })}
            </div>
          ))}

          <div className={styles.group}>
            <h4 className={styles.groupTitle}>
              <Icon name="plus" size={16} /> Comprei a mais
            </h4>
            {extras.map((e, i) => (
              <div key={i} className={styles.item}>
                <span className={`${styles.check} ${styles.checkOn}`}>
                  <Icon name="check" size={13} strokeWidth={3} />
                </span>
                <span className={styles.itemName}>{e}</span>
                <button type="button" className={styles.del} onClick={() => removeExtra(i)} aria-label="Remover">
                  <Icon name="close" size={14} />
                </button>
              </div>
            ))}
            <div className={styles.addRow}>
              <input
                className={styles.addInput}
                value={newExtra}
                placeholder="Adicionar produto…"
                onChange={(e) => setNewExtra(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addExtra();
                }}
              />
              <button type="button" className={styles.addBtn} onClick={addExtra} aria-label="Adicionar">
                <Icon name="plus" size={18} />
              </button>
            </div>
          </div>

          <button type="button" className={styles.startBtn} onClick={() => goPhase("done")}>
            <Icon name="check" size={18} /> Concluir compras
          </button>
        </div>
      )}

      {/* ===== Concluído ===== */}
      {phase === "done" &&
        (finished ? (
          <div className={styles.success}>
            <span className={styles.successIcon}>
              <Icon name="check" size={40} strokeWidth={2.4} />
            </span>
            <h2 className={styles.successTitle}>Compras concluídas! 🎉</h2>
            <p className={styles.successSub}>
              Você comprou {boughtCount} de {total} itens{extras.length ? ` + ${extras.length} a mais` : ""}.
            </p>
            <button type="button" className={styles.startBtn} onClick={resetCompras}>
              Voltar ao início
            </button>
          </div>
        ) : (
          <div className={styles.finishWrap}>
            <FinishFlow
              steps={[
                { icon: "cart", phrase: "Fechando o carrinho…" },
                { icon: "check", phrase: "Tudo comprado! 🎉" }
              ]}
              onDone={() => setFinished(true)}
            />
          </div>
        ))}
    </PatientShell>
  );
}
