// lib/atividade.js — traduz o que a paciente registrou no app dela (consumo do
// plano e compras) para o formato que a tela da nutricionista exibe.
import { CATEGORIA_EXTRA } from "./shopping";

const pad = (n) => String(n).padStart(2, "0");

export const DIA_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const isoDia = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const ddmm = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

// Últimos N dias, do mais antigo para hoje (a barra do diário lê nessa ordem).
export function ultimosDias(n = 7, hoje = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - i);
    out.push(d);
  }
  return out;
}

// Data local, zerada na meia-noite. DATEONLY ("2026-07-20") precisa ser lido
// campo a campo: `new Date` trataria como UTC e, no nosso fuso, voltaria um dia.
function diaLocal(valor) {
  if (!valor) return null;
  const s = String(valor);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Dias que o diário deve mostrar: nunca antes do plano existir.
 * Sem isso a semana aparecia inteira, com dias anteriores ao plano marcados
 * como 0% de adesão — como se a paciente tivesse falhado num plano que ainda
 * não tinha recebido.
 */
export function diasDoDiario(dp, hoje = new Date(), max = 7) {
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const inicio = diaLocal(dp && (dp.startDate || dp.approvedAt || dp.createdAt));

  let primeiro = new Date(fim);
  primeiro.setDate(fim.getDate() - (max - 1));
  if (inicio && inicio > primeiro) primeiro = inicio;

  const out = [];
  for (const d = new Date(primeiro); d <= fim; d.setDate(d.getDate() + 1)) out.push(new Date(d));
  return out.length ? out : [fim]; // plano com início no futuro: mostra só hoje
}

/**
 * Diário da semana a partir dos registros do app da paciente.
 * `dp` é o plano completo — é dele que saem os nomes da refeição e do alimento,
 * porque o registro guarda só o id do item.
 */
export function montaDiario(dp, logs, extras, hoje = new Date()) {
  const idx = new Map();
  let itensDoPlano = 0;
  (dp && dp.meals ? dp.meals : []).forEach((m) => {
    (m.items || []).forEach((it) => {
      itensDoPlano += 1;
      idx.set(it.id, {
        meal: m.name || "Refeição",
        food: it.customFoodName || (it.food && it.food.name) || "Alimento",
        time: (m.preferredTime || "").slice(0, 5),
      });
    });
  });

  const porDia = new Map();
  const doDia = (data) => {
    const dia = String(data).slice(0, 10);
    if (!porDia.has(dia)) porDia.set(dia, { consumidos: 0, registrados: 0, events: [] });
    return porDia.get(dia);
  };

  (logs || []).forEach((l) => {
    const acc = doDia(l.date);
    acc.registrados += 1;
    const ref = idx.get(l.mealItemId) || {};
    if (l.status === "consumed") {
      acc.consumidos += 1;
      return; // seguir o plano não vira evento — a lista mostra o que fugiu dele
    }
    acc.events.push({
      meal: ref.meal || "Refeição",
      food: ref.food || "Item do plano",
      time: ref.time || "",
      ...(l.status === "swapped" ? { to: l.swappedFoodName || "outro alimento" } : { skip: true }),
    });
  });

  (extras || []).forEach((e) => {
    doDia(e.date).events.push({
      meal: "Fora do plano",
      food: e.foodName + (e.quantityG ? ` (${Math.round(Number(e.quantityG))}g)` : ""),
      time: "",
      add: true,
    });
  });

  const hojeIso = isoDia(hoje);
  return diasDoDiario(dp, hoje).map((d) => {
    const dia = isoDia(d);
    const acc = porDia.get(dia);
    // Adesão sobre os itens do plano; sem plano, sobre o que ela registrou.
    const base = itensDoPlano || (acc ? acc.registrados : 0);
    const adesao = acc && base ? Math.min(100, Math.round((acc.consumidos / base) * 100)) : 0;
    return {
      label: DIA_SEMANA[d.getDay()],
      date: ddmm(d),
      isToday: dia === hojeIso,
      adesao,
      events: acc ? acc.events : [],
    };
  });
}

// O local da compra é gravado pela API dentro de `notes`, em JSON.
function leMercado(purchase) {
  if (!purchase || !purchase.notes) return null;
  try {
    const d = JSON.parse(purchase.notes);
    return d && d.market && d.market.name ? d.market : null;
  } catch {
    return null; // notes pode ser texto livre de outra origem
  }
}

/**
 * Histórico de compras da paciente: o que ela levou, quando e onde.
 * Mais recente primeiro — é a ordem em que ela procura.
 */
export function montaHistorico(listas) {
  return (listas || [])
    .map((l) => {
      const itens = Array.isArray(l.items) ? l.items : [];
      const quando = new Date(l.completedAt || (l.purchase && l.purchase.purchasedAt) || l.updatedAt || l.createdAt);
      const valida = !Number.isNaN(quando.getTime());
      const lugar = leMercado(l.purchase);
      return {
        id: l.id,
        quando: valida ? quando.getTime() : 0,
        dia: valida ? DIA_SEMANA[quando.getDay()] : "",
        data: valida ? ddmm(quando) : "—",
        hora: valida ? `${pad(quando.getHours())}:${pad(quando.getMinutes())}` : "",
        mercado: lugar ? lugar.name : null,
        endereco: lugar ? lugar.address : null,
        comprados: itens.filter((i) => i.category !== CATEGORIA_EXTRA && i.isChecked).map((i) => i.name),
        extras: itens.filter((i) => i.category === CATEGORIA_EXTRA).map((i) => i.name),
      };
    })
    .sort((a, b) => b.quando - a.quando);
}

// Histórico de idas ao mercado: uma linha por lista, da mais antiga para a mais
// recente (a tela mostra a última como "última compra").
export function montaCompras(listas) {
  return (listas || [])
    .filter((l) => {
      if (l.status === "completed" || l.status === "archived") return true;
      // A lista em andamento também entra, assim que houver movimento: é ela que
      // carrega o que a paciente marcou e anotou hoje.
      const itens = Array.isArray(l.items) ? l.items : [];
      return itens.some((i) => i.isChecked || i.category === CATEGORIA_EXTRA);
    })
    .map((l) => {
      const itens = Array.isArray(l.items) ? l.items : [];
      const quando = new Date(l.completedAt || l.updatedAt || l.createdAt);
      const valida = !Number.isNaN(quando.getTime());
      return {
        quando: valida ? quando.getTime() : 0,
        day: valida ? DIA_SEMANA[quando.getDay()] : "",
        date: valida ? ddmm(quando) : "—",
        items: itens.filter((i) => i.category !== CATEGORIA_EXTRA && i.isChecked).length,
        extras: itens.filter((i) => i.category === CATEGORIA_EXTRA).map((i) => i.name),
      };
    })
    .sort((a, b) => a.quando - b.quando)
    .map(({ quando, ...t }) => t);
}
