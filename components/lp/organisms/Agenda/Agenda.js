"use client";

import { useState } from "react";
import ArrowButton from "@/components/lp/atoms/ArrowButton/ArrowButton";
import { WHATSAPP_NUMERO } from "@/components/lp/brand";
import styles from "./Agenda.module.css";

const mascaraTelefone = (v) => {
  const d = (v || "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const MODALIDADES = [
  { valor: "presencial", rotulo: "Presencial" },
  { valor: "online", rotulo: "Online" },
];

export default function Agenda() {
  const [dados, setDados] = useState({
    nome: "",
    telefone: "",
    email: "",
    modalidade: "online",
    mensagem: "",
  });
  const [erros, setErros] = useState({});
  const [aviso, setAviso] = useState(null);

  const alterar = (campo) => (e) => {
    const valor = campo === "telefone" ? mascaraTelefone(e.target.value) : e.target.value;
    setDados((d) => ({ ...d, [campo]: valor }));
    setErros((x) => ({ ...x, [campo]: null }));
    setAviso(null);
  };

  function validar() {
    const e = {};
    if (!dados.nome.trim()) e.nome = "Precisamos do seu nome.";
    // 10 dígitos = fixo com DDD; 11 = celular.
    if (dados.telefone.replace(/\D/g, "").length < 10) e.telefone = "Informe o WhatsApp com DDD.";
    // E-mail é opcional, mas se vier tem que ser válido.
    if (dados.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(dados.email.trim())) {
      e.email = "Esse e-mail parece incompleto.";
    }
    return e;
  }

  function enviar(evento) {
    evento.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) return;

    // Sem backend de leads na landing: a conversa começa no WhatsApp, com a
    // mensagem já escrita. Trocar por um POST aqui não muda mais nada da tela.
    if (!WHATSAPP_NUMERO) {
      setAviso(
        "O canal de agendamento ainda não foi configurado. Assim que o número da Beatriz for cadastrado, este formulário abre a conversa no WhatsApp.",
      );
      return;
    }

    const modalidade = MODALIDADES.find((m) => m.valor === dados.modalidade)?.rotulo;
    const texto = [
      `Olá, Beatriz! Meu nome é ${dados.nome.trim()}.`,
      `Gostaria de agendar uma consulta (${modalidade}).`,
      dados.mensagem.trim() ? `\n${dados.mensagem.trim()}` : "",
      `\nMeu contato: ${dados.telefone}`,
      dados.email.trim() ? ` · ${dados.email.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  }

  return (
    <section id="agendar" className={styles.secao} data-lp-nav="onDark">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Agenda</p>
          <h2 className={styles.titulo}>
            Vamos marcar a sua
            <span className={styles.destaque}>primeira consulta.</span>
          </h2>
          <p className={styles.texto}>
            Deixe seu contato e a Beatriz retorna com os horários disponíveis. Leva menos de um
            minuto para preencher.
          </p>
        </div>

        <form className={styles.formulario} onSubmit={enviar} noValidate>
          <div className={styles.campo}>
            <label className={styles.rotulo} htmlFor="agenda-nome">
              Nome
            </label>
            <input
              id="agenda-nome"
              className={`${styles.entrada} ${erros.nome ? styles.entradaErro : ""}`}
              type="text"
              autoComplete="name"
              placeholder="Como podemos te chamar?"
              value={dados.nome}
              onChange={alterar("nome")}
              aria-invalid={!!erros.nome}
              aria-describedby={erros.nome ? "agenda-nome-erro" : undefined}
            />
            {erros.nome && (
              <span id="agenda-nome-erro" className={styles.erro} role="alert">
                {erros.nome}
              </span>
            )}
          </div>

          <div className={styles.campo}>
            <label className={styles.rotulo} htmlFor="agenda-tel">
              WhatsApp
            </label>
            <input
              id="agenda-tel"
              className={`${styles.entrada} ${erros.telefone ? styles.entradaErro : ""}`}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(11) 90000-0000"
              value={dados.telefone}
              onChange={alterar("telefone")}
              aria-invalid={!!erros.telefone}
              aria-describedby={erros.telefone ? "agenda-tel-erro" : undefined}
            />
            {erros.telefone && (
              <span id="agenda-tel-erro" className={styles.erro} role="alert">
                {erros.telefone}
              </span>
            )}
          </div>

          <div className={`${styles.campo} ${styles.campoLargo}`}>
            <label className={styles.rotulo} htmlFor="agenda-email">
              E-mail <span className={styles.opcional}>opcional</span>
            </label>
            <input
              id="agenda-email"
              className={`${styles.entrada} ${erros.email ? styles.entradaErro : ""}`}
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={dados.email}
              onChange={alterar("email")}
              aria-invalid={!!erros.email}
              aria-describedby={erros.email ? "agenda-email-erro" : undefined}
            />
            {erros.email && (
              <span id="agenda-email-erro" className={styles.erro} role="alert">
                {erros.email}
              </span>
            )}
          </div>

          <fieldset className={styles.grupo}>
            <legend className={styles.rotulo}>Atendimento</legend>
            <div className={styles.opcoes}>
              {MODALIDADES.map((m) => (
                <label
                  key={m.valor}
                  className={`${styles.opcao} ${dados.modalidade === m.valor ? styles.opcaoAtiva : ""}`}
                >
                  <input
                    type="radio"
                    name="modalidade"
                    value={m.valor}
                    checked={dados.modalidade === m.valor}
                    onChange={alterar("modalidade")}
                    className={styles.radio}
                  />
                  {m.rotulo}
                </label>
              ))}
            </div>
          </fieldset>

          <div className={`${styles.campo} ${styles.campoLargo}`}>
            <label className={styles.rotulo} htmlFor="agenda-msg">
              O que te trouxe até aqui? <span className={styles.opcional}>opcional</span>
            </label>
            <textarea
              id="agenda-msg"
              className={styles.area}
              rows={3}
              placeholder="Pode escrever à vontade — ou deixar em branco e conversar na consulta."
              value={dados.mensagem}
              onChange={alterar("mensagem")}
            />
          </div>

          {aviso && (
            <p className={styles.aviso} role="status">
              {aviso}
            </p>
          )}

          <div className={styles.rodapeForm}>
            <ArrowButton as="button" label="Enviar e agendar" />
          </div>
        </form>
      </div>
    </section>
  );
}
