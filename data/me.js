// Paciente logado (app do paciente) e a nutri (parceira no chat).
export const ME = {
  name: "Patrick Siqueira",
  firstName: "Patrick",
  peso: 72 // kg — usado para calcular a meta de água
};

export const NUTRI = {
  id: "nutri",
  name: "Nutricionista Beatriz",
  subtitle: "Nutricionista · online",
  online: true,
  pinned: false,
  messages: [
    { from: "them", type: "text", text: "Oi, Patrick! Como você está se sentindo com o plano? 😊" },
    { from: "me", type: "text", text: "Oi! Tô gostando bastante 💪" },
    { from: "them", type: "text", text: "Que ótimo! Qualquer dúvida nas trocas é só me chamar." }
  ]
};
