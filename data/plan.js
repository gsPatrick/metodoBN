// Plano alimentar (padrão WebDiet) — estrutura usada para renderizar o layout.
// Em produção, viria do parsing do PDF/exportação do WebDiet.

export const PLAN = {
  prescritoEm: "29/05/2026",
  totals: { kcal: 2509, c: 335.2, p: 98.0, l: 96.0 },
  meals: [
    {
      time: "06:30",
      name: "Café da manhã",
      icon: "sun",
      kcal: 322,
      macros: { p: 15.8, l: 2.2, c: 60.8 },
      foods: [
        {
          name: "Goma de tapioca",
          qty: "3,5 colheres de sopa rasas (52,5g)",
          subs: ["Cuscuz de milho cozido com sal — 145g", "Mandioca cozida — 125g", "Batata doce cozida — 155g"]
        },
        {
          name: "Frango desfiado",
          qty: "2 colheres de sopa cheias (40g)",
          subs: ["Acém moído cozido — 2 col. sopa rasas (30g)", "Patinho grelhado — 30g", "Músculo cozido — 35g"]
        },
        {
          name: "Vitamina de banana sem lactose",
          qty: "150g",
          subs: ["Vitamina de morango sem lactose — 200g", "Vitamina de abacate sem lactose — 120ml", "Smoothie de manga sem lactose — 200g"]
        }
      ]
    },
    {
      time: "09:40",
      name: "Lanche da manhã",
      icon: "apple",
      kcal: 445,
      macros: { p: 4.7, l: 12.4, c: 80.9 },
      foods: [
        {
          name: "Bolo de Banana Sem Lactose e Sem Ovo",
          qty: "1,5 porção (183g)",
          subs: [
            "Bolo Prestígio Fit (sem lactose/ovo) — 170g",
            "Bolo de Cenoura com Aveia e Castanha — 170g",
            "Muffin de Cacau (sem lactose/ovo) — 1,5 porção (19,5g)"
          ]
        },
        { name: "Uva", qty: "150g", subs: ["Pera — 150g", "Maçã Argentina — 1 unid. média (130g)", "Banana — 80g"] }
      ]
    },
    {
      time: "13:00",
      name: "Almoço",
      icon: "utensils",
      kcal: 594,
      macros: { p: 36.3, l: 24.7, c: 61.9 },
      foods: [
        {
          name: "Arroz integral cozido",
          qty: "2 colheres de servir cheias (110g)",
          subs: ["Macarrão integral cozido — 95g", "Batata inglesa assada — 125g", "Purê de mandioquinha c/ batata doce — 1,6 porção (120g)"]
        },
        {
          name: "Feijão carioca cozido",
          qty: "1 concha rasa (80g)",
          subs: ["Lentilha cozida — 1 concha cheia (85g)", "Ervilha cozida — 2,5 col. sopa cheias (67,5g)", "Feijão fradinho cozido — 1 concha cheia (140g)"]
        },
        {
          name: "Filé de frango grelhado",
          qty: "93g",
          subs: ["Patinho grelhado — 80g", "Acém moído cozido — 85g", "Miolo de alcatra grelhado — 75g"]
        },
        {
          name: "Tomate",
          qty: "2 colheres de sopa rasas (30g)",
          subs: ["Cenoura crua ralada — 1 col. sopa cheia (17g)", "Beterraba cozida — 0,5 col. servir cheia (19g)", "Pepino — 1,5 col. sopa picado (43,5g)"]
        },
        {
          name: "Repolho",
          qty: "1 colher de sopa cheia, picado (10g)",
          subs: ["Alface — 1 folha grande (15g)", "Acelga crua — 1 folha pequena (3g)", "Couve-manteiga — 1 col. sopa cheia (22g)"]
        },
        {
          name: "Cebola",
          qty: "2 colheres de sopa rasas (20g)",
          subs: ["Cenoura crua — 20g", "Abobrinha italiana cozida — 1 col. servir rasa (35g)", "Quiabo cozido — 2 col. sopa cheias (40g)"]
        },
        {
          name: "Laranja Baía",
          qty: "1 unidade média (180g)",
          subs: ["Tangerina Ponkã — 1 unid. grande (270g)", "Abacaxi — 2,5 fatias médias (187,5g)", "Kiwi — 2 unidades (150g)"]
        },
        {
          name: "Azeite de oliva extravirgem",
          qty: "1,3 colher de sopa (16,9ml)",
          subs: ["Óleo de gergelim — 2 col. sopa (16ml)", "Óleo de linhaça — 2 col. sopa rasas (16g)"]
        }
      ]
    },
    {
      time: "15:00",
      name: "Lanche da tarde",
      icon: "leaf",
      kcal: 389,
      macros: { p: 16.7, l: 18.8, c: 40.9 },
      foods: [
        {
          name: "Pão de forma integral",
          qty: "2 fatias (50g)",
          subs: ["Batata doce cozida — 3 col. sopa cheias (126g)", "Pão francês — 1 unidade (50g)", "Cuscuz de milho cozido com sal — 100g"]
        },
        {
          name: "Frango desfiado",
          qty: "30g",
          subs: ["Acém moído cozido — 2 col. sopa rasas (30g)", "Miolo de alcatra grelhado — 25g", "Músculo cozido — 35g"]
        },
        {
          name: "Cenoura cozida",
          qty: "1,5 colher de arroz cheia, picada (60g)",
          subs: ["Beterraba cozida — 60g", "Milho cozido — 50g", "Couve-flor cozida — 1 ramo médio (60g)"]
        },
        {
          name: "Azeite de oliva extravirgem",
          qty: "2 colheres de sopa rasas (16ml)",
          subs: ["Óleo de gergelim — 1,2 col. sopa (9,6ml)", "Óleo de linhaça — 1,2 col. sopa rasas (9,6g)"]
        },
        {
          name: "Melancia",
          qty: "2 fatias pequenas (200g)",
          subs: ["Abacaxi — 2 fatias pequenas (100g)", "Laranja — 1 unid. pequena (90g)", "Tangerina Ponkã — 1 unid. média (135g)"]
        }
      ]
    },
    {
      time: "18:00",
      name: "Jantar",
      icon: "utensils",
      kcal: 416,
      macros: { p: 11.2, l: 24.0, c: 41.9 },
      foods: [
        {
          name: "Arroz integral cozido",
          qty: "2,6 colheres de servir cheias (143g)",
          subs: ["Macarrão integral cozido — 125g", "Purê de Batata Doce (pronto light) — 125g", "Mandioca cozida — 121g"]
        },
        {
          name: "Acém moído cozido",
          qty: "28g",
          subs: ["Frango desfiado — 35g", "Patinho grelhado — 27g", "Músculo cozido — 29g"]
        },
        {
          name: "Azeite de oliva extravirgem",
          qty: "1,5 colher de sopa (19,5ml)",
          subs: ["Óleo de gergelim — 1 col. sopa (8ml)", "Óleo de linhaça — 1 col. sopa rasas (8g)"]
        },
        {
          name: "Suco natural de manga",
          qty: "1 copo americano pequeno (165ml)",
          subs: ["Suco natural de abacaxi — 1 copo médio (200ml)", "Suco natural de morango — 1 copo médio (200ml)", "Suco natural de goiaba vermelha — 110ml"]
        }
      ]
    },
    {
      time: "21:00",
      name: "Ceia",
      icon: "water",
      kcal: 345,
      macros: { p: 13.3, l: 14.0, c: 48.7 },
      foods: [
        {
          name: "Iogurte natural sem lactose",
          qty: "170g",
          subs: ["Smoothie de Banana sem Lactose — 150g", "Smoothie de manga sem lactose — 180g", "Vitamina de morango sem lactose — 180g"]
        },
        { name: "Morango", qty: "6 unidades médias (72g)", subs: ["Kiwi — 60g", "Maçã — 60g", "Pera — 60g"] },
        {
          name: "Semente de chia",
          qty: "2 colheres de sopa cheias (30g)",
          subs: ["Semente de gergelim — 2 col. sopa rasas (30g)", "Semente de girassol — 30g", "Semente de abóbora — 30g"]
        },
        {
          name: "Uva",
          qty: "1 cacho pequeno (170g)",
          subs: ["Maçã — 1 unid. média (130g)", "Pera — 1 unid. média (110g)", "Melão — 1 fatia pequena (70g)"]
        }
      ]
    }
  ],
  shopping: [
    { group: "Cereais e tubérculos", icon: "leaf", items: ["Arroz integral", "Aveia em flocos", "Goma de tapioca", "Pão de forma integral", "Batata doce", "Bolo de aveia caseiro"] },
    { group: "Proteínas e leguminosas", icon: "dumbbell", items: ["Filé de frango", "Frango desfiado", "Feijão carioca"] },
    { group: "Frutas", icon: "apple", items: ["Banana prata", "Laranja", "Manga", "Melancia", "Morango"] },
    { group: "Legumes e verduras", icon: "carrot", items: ["Cebola", "Pepino", "Repolho", "Tomate"] },
    { group: "Gorduras e oleaginosas", icon: "water", items: ["Azeite de oliva extravirgem", "Castanha de caju", "Semente de girassol"] },
    { group: "Laticínios e bebidas", icon: "water", items: ["Iogurte natural sem lactose", "Requeijão sem lactose (Lacfree)", "Suco natural de maracujá"] }
  ],
  // Histórico de compras (datas) — o que a nutri vê do que o paciente comprou.
  purchases: [
    { day: "Seg", date: "23/06", items: 16, extras: ["Ovos (12 un)", "Café torrado"] },
    { day: "Qui", date: "26/06", items: 5, extras: [] },
    { day: "Sáb", date: "28/06", items: 7, extras: ["Azeite extra"] }
  ],
  // Diário: o que o paciente registrou em cada dia (somente leitura para a nutri).
  // event sem "to" e com skip:true = não comeu; com "to" = trocou food -> to.
  diary: [
    { label: "Seg", date: "23/06", adesao: 100, events: [] },
    {
      label: "Ter",
      date: "24/06",
      adesao: 92,
      events: [
        { meal: "Café da manhã", food: "Goma de tapioca", to: "Batata doce cozida", time: "06:48" },
        { meal: "Almoço", food: "Tomate", skip: true, time: "13:10" }
      ]
    },
    {
      label: "Qua",
      date: "25/06",
      adesao: 96,
      events: [{ meal: "Lanche da tarde", food: "Melancia", to: "Abacaxi", time: "15:20" }]
    },
    {
      label: "Qui",
      date: "26/06",
      adesao: 85,
      events: [
        { meal: "Almoço", food: "Arroz integral cozido", to: "Macarrão integral cozido", time: "13:05" },
        { meal: "Jantar", food: "Acém moído cozido", to: "Frango desfiado", time: "18:30" },
        { meal: "Ceia", food: "Morango", skip: true, time: "21:15" }
      ]
    },
    { label: "Sex", date: "27/06", adesao: 100, events: [] },
    {
      label: "Sáb",
      date: "28/06",
      adesao: 73,
      events: [
        { meal: "Lanche da manhã", food: "Bolo de Banana", skip: true, time: "09:50" },
        { meal: "Almoço", food: "Filé de frango grelhado", to: "Patinho grelhado", time: "13:20" },
        { meal: "Jantar", food: "Suco natural de manga", to: "Suco natural de abacaxi", time: "18:40" },
        { meal: "Ceia", food: "Uva", skip: true, time: "21:30" }
      ]
    },
    {
      label: "Dom",
      date: "29/06",
      adesao: 88,
      events: [
        { meal: "Café da manhã", food: "Vitamina de banana sem lactose", to: "Vitamina de abacate sem lactose", time: "07:10" },
        { meal: "Lanche da tarde", food: "Pão de forma integral", skip: true, time: "15:30" }
      ]
    }
  ],
  recipes: [
    {
      name: "Purê de mandioquinha com batata doce",
      yield: "2 porções",
      ingredients: ["Batata baroa (mandioquinha) — 50g", "Batata doce — 100g", "Noz-moscada em pó — a gosto", "Sal refinado — a gosto"],
      steps: [
        "Cozinhe a mandioquinha e a batata doce na água por 10 minutos.",
        "Escorra a água.",
        "Amasse a mandioquinha e a batata doce.",
        "Misture e tempere com sal e noz-moscada a gosto.",
        "Sirva."
      ]
    },
    {
      name: "Vitamina de abacate sem lactose",
      yield: "3 porções",
      ingredients: ["Abacate — 1 unidade média (430g)", "Leite integral sem lactose — 1L"],
      steps: ["Bata todos os ingredientes no liquidificador.", "Sirva."]
    },
    {
      name: "Vitamina de morango sem lactose",
      yield: "1 porção",
      ingredients: ["Morango — 60g (5 unidades médias)", "Leite sem lactose — 150ml", "Gelo a gosto (opcional)"],
      steps: [
        "Lave e higienize os morangos.",
        "Retire as folhas e corte em pedaços.",
        "Coloque os morangos e o leite no liquidificador.",
        "Bata por ~1 minuto até ficar homogêneo.",
        "Adicione gelo, se desejar, e sirva."
      ]
    },
    {
      name: "Smoothie de Banana sem Lactose",
      yield: "1 porção",
      ingredients: ["Banana prata — 110g (1 unidade grande)", "Iogurte natural sem lactose — 160g", "Canela em pó a gosto", "Gelo a gosto"],
      steps: [
        "Descasque a banana e corte em rodelas.",
        "Coloque a banana e o iogurte no liquidificador.",
        "Bata até ficar homogêneo e cremoso.",
        "Se desejar, acrescente canela e gelo.",
        "Sirva imediatamente."
      ]
    },
    {
      name: "Smoothie de manga sem lactose",
      yield: "1 porção",
      ingredients: ["Manga picada — 80g (1 unidade pequena)", "Iogurte natural sem lactose — 100g", "Gelo a gosto"],
      steps: ["Bata todos os ingredientes no liquidificador até ficar cremoso."]
    },
    {
      name: "Bolo Prestígio Fit (sem lactose e sem ovo)",
      yield: "4 porções",
      ingredients: ["Coco ralado sem açúcar — 100g", "Bananas maduras amassadas — 2", "Cacau em pó 100% — 15g", "Óleo de coco — 1 col. sopa", "Fermento — 1 col. chá"],
      steps: ["Misture todos os ingredientes.", "Coloque em forma pequena.", "Asse a 180°C por ~25 minutos."]
    },
    {
      name: "Muffin de Banana e Cacau (sem lactose e sem ovo)",
      yield: "4 porções",
      ingredients: ["Bananas maduras — 2", "Cacau 100% — 20g", "Óleo de coco extravirgem — 2 colheres", "Fermento — 1 col. chá"],
      steps: ["Amasse as bananas.", "Misture os demais ingredientes.", "Distribua em forminhas.", "Asse por 20 minutos."]
    },
    {
      name: "Bolo de Banana sem Lactose e sem Ovo",
      yield: "4 porções",
      ingredients: [
        "Bananas maduras amassadas — 3 (330g)",
        "Farinha de arroz — 100g",
        "Óleo de canola — 30ml",
        "Água — 50ml",
        "Canela em pó — 1 col. chá (opcional)",
        "Fermento químico — 1 col. chá (5g)"
      ],
      steps: [
        "Pré-aqueça o forno a 180°C.",
        "Amasse as bananas até formar um purê.",
        "Adicione a farinha de arroz, o óleo e a água.",
        "Misture até obter massa homogênea.",
        "Acrescente a canela e o fermento por último.",
        "Coloque em forma pequena untada.",
        "Asse por ~30 minutos ou até dourar."
      ]
    }
  ]
};
