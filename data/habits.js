// Gamificação: hábitos diários (treino, sono, água) → pontuação do dia.
const KEY = "bn_habitos_me";
export const WATER_GOAL_ML = 2000; // fallback quando o peso não está disponível
export const WATER_ML_PER_KG = 35; // recomendação: 35 ml por kg de peso

// Meta diária de água (ml) baseada no peso (vem da anamnese/perfil). Arredonda em 50 ml.
export function waterGoal(weightKg) {
  const kg = Number(weightKg);
  if (!kg || kg <= 0) return WATER_GOAL_ML;
  return Math.round((kg * WATER_ML_PER_KG) / 50) * 50;
}

// recipientes que o paciente pode registrar (cada um com sua quantidade)
export const CONTAINERS = [
  { label: "Gole", ml: 100 },
  { label: "Copo", ml: 200 },
  { label: "Copo grande", ml: 300 },
  { label: "Caneca", ml: 350 },
  { label: "Garrafa", ml: 500 },
  { label: "Garrafa 1L", ml: 1000 }
];

export function litrosFromMl(ml) {
  const l = (ml || 0) / 1000;
  return (Number.isInteger(l) ? l.toFixed(0) : l.toFixed(1)).replace(".", ",");
}

function dstr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function todayStr() {
  return dstr(new Date());
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dstr(d);
}

const DEFAULT = { date: "", treino: false, sono: false, agua: 0, streak: 0, lastComplete: "" };

export function getHabits() {
  const today = todayStr();
  let data = { ...DEFAULT, date: today };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.date === today) {
        data = { ...data, ...d };
      } else {
        // novo dia: zera hábitos; mantém a sequência se ontem foi completo
        data.streak = d.lastComplete === yesterdayStr() ? d.streak || 0 : 0;
        data.lastComplete = d.lastComplete || "";
        localStorage.setItem(KEY, JSON.stringify(data));
      }
    }
  } catch {
    /* ignora */
  }
  // migração: formato antigo (água em copos) → ml
  if (data.agua && data.agua < 100) data.agua = 0;
  return data;
}

export function saveHabits(h) {
  const today = todayStr();
  const next = { ...h, date: today };
  const complete = next.treino && next.sono && (next.agua || 0) >= WATER_GOAL_ML;
  if (complete && next.lastComplete !== today) {
    next.streak = next.lastComplete === yesterdayStr() ? (next.streak || 0) + 1 : 1;
    next.lastComplete = today;
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignora */
  }
  return next;
}

export function scoreOf(h, goal = WATER_GOAL_ML) {
  const w = Math.min(1, (h.agua || 0) / (goal || WATER_GOAL_ML));
  return Math.round((h.treino ? 35 : 0) + (h.sono ? 35 : 0) + w * 30);
}

export const LEVELS = [
  { max: 20, face: "😞", label: "Bora começar!" },
  { max: 45, face: "😕", label: "Dá pra mais" },
  { max: 70, face: "😐", label: "No caminho" },
  { max: 90, face: "🙂", label: "Mandando bem!" },
  { max: 101, face: "😄", label: "Dia perfeito!" }
];
export function levelOf(score) {
  return LEVELS.find((l) => score < l.max) || LEVELS[LEVELS.length - 1];
}
