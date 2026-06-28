// lib/shopping.js — organiza a lista de compras em categorias (igual ao app),
// a partir dos ingredientes do plano (lista do plano ou alimentos das refeições).

const CATEGORIES = [
  {
    group: "Cereais e tubérculos",
    icon: "leaf",
    kw: ["arroz", "aveia", "tapioca", "goma", "pão", "pao", "batata", "mandioca", "mandioquinha", "cuscuz", "milho", "macarrão", "macarrao", "farinha", "granola", "bolo", "cereal", "quinoa", "inhame", "cará", "cara", "aipim", "biscoito", "torrada", "pipoca", "trigo", "centeio"],
  },
  {
    group: "Proteínas e leguminosas",
    icon: "dumbbell",
    kw: ["frango", "carne", "filé", "file", "acém", "acem", "patinho", "músculo", "musculo", "alcatra", "coxão", "coxao", "ovo", "peixe", "atum", "salmão", "salmao", "tilápia", "tilapia", "sardinha", "feijão", "feijao", "lentilha", "ervilha", "grão", "grao", "soja", "proteína", "proteina", "whey", "moído", "moido", "desfiado", "bife", "presunto", "peito de peru"],
  },
  {
    group: "Frutas",
    icon: "apple",
    kw: ["banana", "laranja", "manga", "melancia", "morango", "maçã", "maca", "pera", "uva", "abacate", "kiwi", "abacaxi", "tangerina", "ponkã", "ponka", "maracujá", "maracuja", "goiaba", "melão", "melao", "mamão", "mamao", "ameixa", "açaí", "acai", "limão", "limao", "cacho", "fruta"],
  },
  {
    group: "Legumes e verduras",
    icon: "carrot",
    kw: ["cebola", "pepino", "repolho", "tomate", "alface", "cenoura", "beterraba", "abobrinha", "couve", "brócolis", "brocolis", "quiabo", "alho", "pimentão", "pimentao", "abóbora", "abobora", "espinafre", "rúcula", "rucula", "acelga", "chuchu", "vagem", "berinjela", "salada", "verdura", "legume"],
  },
  {
    group: "Gorduras e oleaginosas",
    icon: "water",
    kw: ["azeite", "óleo", "oleo", "castanha", "semente", "amêndoa", "amendoa", "amendoim", "noz", "nozes", "gergelim", "linhaça", "linhaca", "chia", "manteiga", "margarina", "coco", "girassol", "pasta de amendoim"],
  },
  {
    group: "Laticínios e bebidas",
    icon: "water",
    kw: ["iogurte", "leite", "queijo", "requeijão", "requeijao", "lacfree", "kefir", "coalhada", "ricota", "cottage", "nata", "creme de leite", "suco", "café", "cafe", "chá", "cha", "bebida", "vitamina", "smoothie"],
  },
];

const ORDER = CATEGORIES.map((c) => c.group).concat("Outros");

function classify(name) {
  const n = (name || "").toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.kw.some((k) => n.includes(k))) return cat;
  }
  return { group: "Outros", icon: "cart" };
}

// items: array de strings (nomes de produto). Retorna [{ group, icon, items }] ordenado e sem repetição.
export function categorizeShopping(items) {
  const groups = new Map();
  (items || []).forEach((raw) => {
    const name = (typeof raw === "string" ? raw : raw && raw.name) || "";
    if (!name.trim()) return;
    const cat = classify(name);
    if (!groups.has(cat.group)) groups.set(cat.group, { group: cat.group, icon: cat.icon, items: [] });
    const g = groups.get(cat.group);
    if (!g.items.some((x) => x.toLowerCase() === name.toLowerCase())) g.items.push(name);
  });
  return ORDER.map((o) => groups.get(o)).filter(Boolean);
}

// Extrai os ingredientes (nomes de alimento) das refeições de um plano da API.
export function ingredientsFromMeals(meals) {
  const seen = new Set();
  const out = [];
  (meals || []).forEach((m) => {
    (m.items || m.foods || []).forEach((it) => {
      const name = it.customFoodName || (it.food && it.food.name) || it.name || "";
      const clean = name.trim();
      if (clean && !seen.has(clean.toLowerCase())) {
        seen.add(clean.toLowerCase());
        out.push(clean);
      }
    });
  });
  return out;
}
