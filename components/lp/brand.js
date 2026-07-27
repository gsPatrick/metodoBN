// Dados da marca usados em mais de uma seção. Um lugar só para não divergirem.

export const NOME = "Beatriz Nascimento";

// ⚠️ SUBSTITUIR pelo CRN real antes de publicar.
// É registro profissional regulamentado pelo CFN — este valor é só marcador.
// Não inventar: número errado é problema dela com o conselho.
export const CRN = "CRN-3 00000";

// ⚠️ SUBSTITUIR pelos canais reais. Não inventei nenhum: número errado manda
// paciente para o contato de outra pessoa.

// Só dígitos, com DDI. Ex.: "5511990001122". Vazio = formulário avisa que o
// canal ainda não está configurado, em vez de fingir que enviou.
export const WHATSAPP_NUMERO = "";

export const WHATSAPP_URL = WHATSAPP_NUMERO ? `https://wa.me/${WHATSAPP_NUMERO}` : "#agendar";
export const AGENDAR_URL = "#agendar";
