// Lista de pacientes (mock) usada pela página de Pacientes e de Mensagens.
export const PATIENTS = [
  {
    id: "1",
    name: "Carlos Mendes",
    sexo: "Masculino",
    idade: 34,
    objetivo: "Emagrecimento",
    lastVisit: "18/06",
    online: true,
    unread: 0,
    pinned: false,
    plano: false,
    fruit: "morango",
    time: "09:24",
    messages: [
      { from: "them", text: "Doutora, posso trocar o lanche da tarde?" },
      { from: "me", text: "Pode sim! Deixei 3 opções equivalentes no seu plano 😊" }
    ]
  },
  {
    id: "2",
    name: "Beatriz Lima",
    sexo: "Feminino",
    idade: 29,
    objetivo: "Saúde e energia",
    lastVisit: "20/06",
    online: false,
    unread: 2,
    pinned: false,
    plano: true,
    fruit: "banana",
    time: "08:10",
    messages: [
      { from: "them", text: "Recebi o plano, obrigada! 🥗" },
      { from: "me", text: "Qualquer dúvida me chama 😊" }
    ]
  },
  {
    id: "3",
    name: "Rafael Alves",
    sexo: "Masculino",
    idade: 41,
    objetivo: "Ganho de massa",
    lastVisit: "02/06",
    online: false,
    unread: 0,
    pinned: true,
    plano: true,
    fruit: "laranja",
    time: "ontem",
    messages: [
      { from: "me", text: "Rafael, vamos agendar sua anamnese?" },
      { from: "them", text: "Claro, quinta de tarde funciona pra mim" },
      { from: "them", type: "image", src: "/fruits/salada.png", name: "refeicao.png", time: "09:12" },
      { from: "them", text: "Olha o que almocei hoje 🥗" },
      { from: "me", type: "doc", src: "/fruits/LEIA-ME.md", name: "plano-alimentar.pdf", size: "128 KB", time: "09:20" }
    ]
  },
  {
    id: "4",
    name: "Juliana Costa",
    sexo: "Feminino",
    idade: 27,
    objetivo: "Reeducação alimentar",
    lastVisit: "20/06",
    online: false,
    unread: 1,
    pinned: false,
    plano: false,
    fruit: "maca",
    time: "ontem",
    messages: [{ from: "them", text: "Adorei o cardápio dessa semana! 🥗" }]
  },
  {
    id: "5",
    name: "Marina Souza",
    sexo: "Feminino",
    idade: 35,
    objetivo: "Mais disposição",
    lastVisit: "—",
    online: true,
    unread: 0,
    pinned: false,
    plano: false,
    fruit: "morango",
    time: "seg",
    messages: [{ from: "me", text: "Até logo na consulta de hoje!" }]
  },
  {
    id: "6",
    name: "Pedro Henrique",
    sexo: "Masculino",
    idade: 52,
    objetivo: "Controle glicêmico",
    lastVisit: "15/06",
    online: false,
    unread: 0,
    pinned: false,
    plano: true,
    fruit: "laranja",
    time: "12/06",
    messages: [{ from: "them", text: "Doutora, posso comer fruta à noite?" }]
  },
  {
    id: "7",
    name: "Larissa Gomes",
    sexo: "Feminino",
    idade: 24,
    objetivo: "Performance esportiva",
    lastVisit: "—",
    online: true,
    unread: 3,
    pinned: false,
    plano: false,
    fruit: "banana",
    time: "agora",
    messages: [
      { from: "them", text: "Oi! Quando a gente começa?" },
      { from: "them", text: "Tô super animada 💪" }
    ]
  }
];

export function initials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function lastMessagePreview(p) {
  const m = p.messages && p.messages[p.messages.length - 1];
  if (!m) return "";
  let body = "";
  if (m.type === "image") body = "📷 Imagem";
  else if (m.type === "doc") body = "📄 Documento";
  else if (m.type === "audio") body = "🎤 Áudio";
  else body = m.text || "";
  return (m.from === "me" ? "Você: " : "") + body;
}
