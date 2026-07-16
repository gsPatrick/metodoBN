"use client";

import { Fragment, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

import AppShell from "@/components/organisms/AppShell/AppShell";
import Card from "@/components/atoms/Card/Card";
import Icon from "@/components/atoms/Icon/Icon";
import Input from "@/components/atoms/Input/Input";
import Button from "@/components/atoms/Button/Button";
import FinishFlow from "@/components/molecules/FinishFlow/FinishFlow";
import { apiPut, apiGet } from "@/lib/api";

const SECTIONS = [
  { key: "geral", title: "Informações gerais", icon: "clipboard", sub: "Identificação e dados gerais do paciente." },
  { key: "socio", title: "Condições socioeconômicas", icon: "users", sub: "Renda, moradia e convívio." },
  { key: "estilo", title: "Estilo de vida", icon: "flame", sub: "Sono, hábitos, disposição, exercício e atividade física diária." },
  { key: "reprod", title: "Reprodução", icon: "heart", sub: "Saúde reprodutiva (quando aplicável)." },
  { key: "patolFam", title: "História patológica familiar", icon: "users", sub: "Histórico de saúde da família." },
  { key: "patolHist", title: "História patológica", icon: "pill", sub: "Pregressa, atual e medicamentos do paciente." },
  { key: "gastro", title: "História nutricional", icon: "utensils", sub: "Aparelho gastrointestinal." },
  { key: "ritmos", title: "Ritmo intestinal e urinário", icon: "activity", sub: "Funcionamento intestinal e urinário." },
  { key: "habitos", title: "Hábitos alimentares", icon: "leaf", sub: "Apetite, mastigação e preferências." },
  { key: "exame", title: "Exame físico / Semiologia", icon: "eye", sub: "Avaliação clínica." },
  { key: "bioq", title: "Exames bioquímicos", icon: "chart", sub: "Resultados laboratoriais." },
  { key: "record", title: "Recordatório alimentar habitual", icon: "clock", sub: "Dia alimentar típico." },
  { key: "freq", title: "Frequência alimentar", icon: "cart", sub: "Consumo por grupo de alimentos." },
  { key: "antro", title: "Avaliação antropométrica", icon: "scale", sub: "Medidas corporais." },
  { key: "final", title: "Diagnóstico e objetivos", icon: "target", sub: "Conclusão da anamnese." }
];

const ESCALA = ["Baixa", "Regular", "Boa", "Ótima", "Ruim"];
const SONO = ["Bom", "Regular", "Ruim", "Péssimo"];
const SIMNAO = ["Sim", "Não"];
const FREQ_ESCALA = ["Nunca", "Raramente", "Algumas vezes", "Sempre"];
const FAMILIAR = ["Obesidade", "DM", "HAS", "AVC", "Câncer", "Dislipidemia", "Cardiopatia"];
const GI = ["Disfagia", "Odinofagia", "Náuseas", "Êmese", "Disgeusia", "Xerostomia", "Dor abdominal"];
const SEMIO = ["Cabelos", "Mucosas", "Lábios", "Língua", "Dentição", "Pele", "Unhas", "Abdômen", "Edema"];
const ATIV_DIARIA = ["Tempo de tela", "Tempo sentado", "Como se desloca", "Tarefas domésticas", "Utilização de escadas"];
const OLEO = ["Não usa", "Margarina/manteiga", "Azeite de oliva", "Óleo de soja/milho/outros", "Bacon", "Banha de porco", "Não sabe/não cozinha"];

const EXAMES = [
  "Hemácias", "Hemoglobina", "Hematócritos", "VGM", "HGM", "CHGM", "RDW", "Leucócitos", "Plaquetas",
  "Glicemia Jejum", "Hemoglobina glicada", "Curva glicêmica", "Colesterol Total", "LDL-c", "HDL-c", "VLDL-c",
  "TSH", "T3", "T4", "Ureia", "Creatinina", "Fosfatase alcalina", "Gama GT", "TGO", "TGP", "PCR",
  "Vit. D", "Vit. B12", "Sumário de Urina", "Parasitológico de Fezes"
];

const FREQ_FOODS = [
  "Café", "Refrigerantes", "Água com gás", "Chá mate/verde/preto", "Doces", "Chocolates", "Temperos prontos",
  "Frituras (acarajé, salgados, batata, empanados)", "Álcool (vinho, cerveja, whisky, vodka, licor)",
  "Embutidos (salsicha, mortadela, presunto…)", "Cereais integrais", "Vegetais crus", "Vegetais cozidos",
  "Frutas", "Peixes", "Carne vermelha", "Carne suína", "Leites", "Derivados do leite (queijo, margarina…)",
  "Ovos", "Pão branco", "Raízes e tubérculos", "Feijão", "Arroz", "Suco industrializado", "Farinha de mandioca", "Outros"
];
const FREQ_COLS = ["d12", "d3", "s1", "s2", "s34", "m1", "m2", "m3", "nunca"];

const ANTRO_ROWS = [
  "Altura (cm)", "Peso usual", "Peso atual", "IMC", "C. Pescoço", "CB", "CC", "CA", "CQ", "RCQ",
  "C. Coxa", "C. Panturrilha", "DCT", "DCB", "DCSE", "DCSI", "DCA Média", "DC Peito", "DC Abdominal",
  "DC Coxa", "DC Panturrilha", "AGB", "CMB", "AMB", "AMBc", "∑4 dobras", "∑2 dobras", "% MG"
];

/* ===== máscaras ===== */
const onlyDigits = (v) => (v || "").replace(/\D/g, "");
const maskCPF = (v) =>
  onlyDigits(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskCEP = (v) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
const maskPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};
const maskMoney = (v) => {
  const d = onlyDigits(v);
  if (!d) return "";
  return (parseInt(d, 10) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};
const maskNum = (v) => onlyDigits(v);
const maskDate = (v) => {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
};
const maskDecimal = (v) => {
  let s = String(v).replace(/[^\d.,]/g, "");
  const i = s.search(/[.,]/);
  if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/[.,]/g, "");
  return s;
};

function Segment({ options, value, onChange, label }) {
  return (
    <div className={styles.segment} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`${styles.segItem} ${value === o ? styles.segActive : ""}`}
          onClick={() => onChange(o)}
          aria-pressed={value === o}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function AnamneseInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const readonly = searchParams.get("view") === "1";
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({});
  const [ready, setReady] = useState(false);
  const [patientId, setPatientId] = useState(searchParams.get("patient") || null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // restaura rascunho salvo (ou pré-preenche do cadastro / anamnese finalizada)
  useEffect(() => {
    let active = true;

    async function load() {
      if (readonly) {
        if (patientId) {
          try {
            const a = await apiGet(`/anamnesis/${patientId}`);
            if (!active) return;
            if (a && a.generalInfo && Object.keys(a.generalInfo).length) {
              setForm(a.generalInfo);
              setReady(true);
              return;
            }
          } catch {
            /* tenta fallback local */
          }
        }
        try {
          const fin = localStorage.getItem("bn_anamnese_final");
          if (fin) {
            const d = JSON.parse(fin);
            // só usa o fallback local se pertencer a este paciente (ou se não houver como saber)
            if (d.form && (!d.patientId || !patientId || d.patientId === patientId)) setForm(d.form);
          }
        } catch {
          /* ignora */
        }
        if (active) setReady(true);
        return;
      }

      // ---- modo edição ----
      // 1) rascunho local (guarda também o paciente a que pertence)
      try {
        const draft = localStorage.getItem("bn_anamnese_draft");
        if (draft) {
          const d = JSON.parse(draft);
          const belongs = !patientId || !d.patientId || d.patientId === patientId;
          if (belongs && d.form) {
            if (d.patientId) setPatientId((cur) => cur || d.patientId);
            setForm(d.form);
            if (typeof d.index === "number") setIndex(d.index);
            if (active) setReady(true);
            return;
          }
        }
      } catch {
        /* ignora */
      }

      // 2) dados vindos do cadastro (novo paciente)
      let pid = patientId;
      let base = null;
      try {
        const novo = sessionStorage.getItem("bn_anamnese_patient") || sessionStorage.getItem("bn_novo_paciente");
        if (novo) {
          const d = JSON.parse(novo);
          if (d.patientProfileId) pid = pid || d.patientProfileId;
          base = {
            nome: d.nome || "",
            sexo: d.sexo || "",
            nascimento: d.nascimento || "",
            email: d.email || "",
            celular: d.celular || d.telefone || ""
          };
        }
      } catch {
        /* ignora */
      }
      if (pid && pid !== patientId) setPatientId(pid);

      if (pid) {
        // 3) anamnese já existente na API — continua/edita de onde parou
        try {
          const a = await apiGet(`/anamnesis/${pid}`);
          if (!active) return;
          if (a && a.generalInfo && Object.keys(a.generalInfo).length) {
            setForm({ ...(base || {}), ...a.generalInfo });
            setReady(true);
            return;
          }
        } catch {
          /* segue para os fallbacks */
        }

        // 4) recuperação: anamnese concluída que não chegou à API (ficou só neste navegador)
        try {
          const fin = localStorage.getItem("bn_anamnese_final");
          if (fin) {
            const d = JSON.parse(fin);
            if (d && d.form) {
              const norm = (s) => String(s || "").trim().toLowerCase();
              let belongs = d.patientId === pid;
              if (!d.patientId) {
                // formato antigo (sem id do paciente): confere pelo nome do perfil
                let nome = base && base.nome;
                if (!nome) {
                  const p = await apiGet(`/users/profiles/${pid}`).catch(() => null);
                  if (!active) return;
                  nome = p && p.user && p.user.name;
                }
                belongs = !!nome && norm(nome) === norm(d.form.nome);
              }
              if (belongs) {
                setForm({ ...(base || {}), ...d.form });
                if (active) setReady(true);
                return;
              }
            }
          }
        } catch {
          /* ignora */
        }
      }

      if (base) setForm((p) => ({ ...p, ...base }));
      if (active) setReady(true);
    }

    load();
    return () => {
      active = false;
    };
  }, [readonly, patientId]);

  // salva automaticamente a cada mudança (etapa + respostas + paciente)
  useEffect(() => {
    if (!ready || readonly) return;
    try {
      localStorage.setItem("bn_anamnese_draft", JSON.stringify({ index, form, patientId }));
    } catch {
      /* ignora */
    }
  }, [ready, readonly, index, form, patientId]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggle = (g, item) =>
    setForm((p) => {
      const cur = { ...(p[g] || {}) };
      cur[item] = !cur[item];
      return { ...p, [g]: cur };
    });
  const has = (g, item) => !!(form[g] && form[g][item]);

  // busca endereço pelo CEP (ViaCEP)
  async function buscarCep(cep) {
    const d = onlyDigits(cep);
    if (d.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const data = await res.json();
      if (data && !data.erro) {
        setForm((p) => ({
          ...p,
          endereco: data.logradouro || p.endereco || "",
          bairro: data.bairro || p.bairro || "",
          cidade: data.localidade ? `${data.localidade}${data.uf ? " - " + data.uf : ""}` : p.cidade || ""
        }));
      }
    } catch {
      /* ignora */
    }
  }

  const In = (k, props = {}) => {
    const { mask, ...rest } = props;
    return <Input value={form[k] || ""} onChange={(e) => set(k, mask ? mask(e.target.value) : e.target.value)} {...rest} />;
  };
  const Ar = (k, placeholder) => (
    <textarea className={styles.textarea} value={form[k] || ""} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} />
  );
  const Sg = (k, options) => <Segment options={options} value={form[k]} onChange={(v) => set(k, v)} label={k} />;
  // horas: digita só número (apaga livre), formata "Xh" ao sair do campo
  const HoursIn = (k) => (
    <Input
      value={form[k] || ""}
      inputMode="numeric"
      placeholder="Ex.: 40h"
      onChange={(e) => set(k, onlyDigits(e.target.value).slice(0, 3))}
      onBlur={(e) => {
        const d = onlyDigits(e.target.value).slice(0, 3);
        set(k, d ? `${d}h` : "");
      }}
    />
  );
  const Freq = (k) => (
    <div className={styles.freqRow}>
      <Input
        value={form[`${k}_n`] || ""}
        onChange={(e) => set(`${k}_n`, onlyDigits(e.target.value))}
        inputMode="numeric"
        placeholder="Qtd. de vezes"
      />
      <select className={styles.select} value={form[`${k}_u`] || ""} onChange={(e) => set(`${k}_u`, e.target.value)} aria-label="Período">
        <option value="">Período…</option>
        <option value="hora">por hora</option>
        <option value="dia">por dia</option>
        <option value="semana">por semana</option>
        <option value="mes">por mês</option>
        <option value="ano">por ano</option>
      </select>
    </div>
  );

  // ===== cálculos automáticos da antropometria =====
  const antroNum = (r, c) => {
    const v = parseFloat(String(form[`antro_${r}_${c}`] || "").replace(",", "."));
    return Number.isFinite(v) ? v : null;
  };
  // índices: 0 Altura · 2 Peso atual · 3 IMC · 6 CC · 8 CQ · 9 RCQ · 12 DCT · 13 DCB · 14 DCSE · 15 DCSI · 25 ∑4 dobras
  const ANTRO_AUTO = { 3: "imc", 9: "rcq", 25: "soma4" };
  function antroCalc(r, c) {
    const kind = ANTRO_AUTO[r];
    if (kind === "imc") {
      const alt = antroNum(0, c);
      const peso = antroNum(2, c);
      if (alt && peso) return (peso / Math.pow(alt / 100, 2)).toFixed(1);
    }
    if (kind === "rcq") {
      const cc = antroNum(6, c);
      const cq = antroNum(8, c);
      if (cc && cq) return (cc / cq).toFixed(2);
    }
    if (kind === "soma4") {
      const ds = [antroNum(12, c), antroNum(13, c), antroNum(14, c), antroNum(15, c)];
      if (ds.every((x) => x != null)) return ds.reduce((a, b) => a + b, 0).toFixed(1);
    }
    return "";
  }

  // Reprodução só aparece para sexo feminino
  const isFemale = (form.sexo || "").trim().toLowerCase().startsWith("f");
  const sections = useMemo(() => SECTIONS.filter((s) => s.key !== "reprod" || isFemale), [isFemale]);

  useEffect(() => {
    if (index > sections.length - 1) setIndex(sections.length - 1);
  }, [sections.length, index]);

  const section = sections[index] || sections[sections.length - 1];
  const isLast = index === sections.length - 1;
  const pct = Math.round(((index + 1) / sections.length) * 100);

  async function finalize() {
    setSaving(true);
    setSaveError(null);
    try {
      // Sem paciente identificado NÃO conclui: antes o salvamento era pulado em
      // silêncio e a anamnese "finalizada" nunca chegava à API.
      if (!patientId) {
        throw new Error(
          "Não foi possível identificar o paciente desta anamnese. Suas respostas estão guardadas como rascunho — abra a anamnese pela página do paciente (Pacientes → paciente → Anamnese) e conclua novamente."
        );
      }
      // Persiste a anamnese completa na API (snapshot + status finalizado).
      await apiPut(`/anamnesis/${patientId}`, { generalInfo: form, status: "completed" });
      try {
        localStorage.removeItem("bn_anamnese_draft");
        localStorage.setItem("bn_anamnese_final", JSON.stringify({ form, patientId }));
      } catch {
        /* ignora */
      }
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setSaveError(e && e.message ? e.message : "Não foi possível salvar a anamnese.");
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (isLast) {
      if (readonly) {
        router.push(patientId ? `/pacientes/${patientId}` : "/pacientes");
        return;
      }
      finalize();
      return;
    }
    setIndex((i) => i + 1);
    window.scrollTo({ top: 0 });
  }
  function back() {
    setIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0 });
  }

  const tituloAnamnese = form.nome && form.nome.trim() ? `Anamnese do(a) paciente: ${form.nome.trim()}` : "Anamnese";

  if (!ready) {
    return (
      <AppShell active="anamnese" title="Anamnese">
        <div className={styles.page}>
          <Card elevation="sm" padding="lg">
            <p className={styles.sub}>Carregando anamnese…</p>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (done) {
    return (
      <AppShell active="anamnese" title={tituloAnamnese}>
        <div className={styles.page}>
          <Card elevation="sm" padding="lg">
            <FinishFlow
              steps={[
                { icon: "clipboard", phrase: "Salvando a anamnese…" },
                { icon: "users", phrase: "Montando a ficha do paciente…" },
                { icon: "check", phrase: "Pronto! Abrindo o perfil 🎉" }
              ]}
              onDone={() => router.push(patientId ? `/pacientes/${patientId}` : "/pacientes")}
            />
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="anamnese" title={tituloAnamnese}>
      <div className={styles.page}>
        {readonly && (
          <div className={styles.viewNote}>
            <Icon name="eye" size={16} /> Anamnese finalizada — somente leitura.
          </div>
        )}
        {index > 0 && (
          <button type="button" className={styles.topBack} onClick={back}>
            <Icon name="chevronLeft" size={18} />
            Voltar
          </button>
        )}

        <div className={styles.progress}>
          <div className={styles.progressTop}>
            <span className={styles.progressLabel}>{section.title}</span>
            <span className={styles.progressCount}>
              Seção {index + 1} de {sections.length}
            </span>
          </div>
          <div className={styles.progressTrack}>
            <span className={styles.progressFill} style={{ "--p": `${pct}%` }} />
          </div>
        </div>

        <Card elevation="sm" padding="lg">
          <div className={styles.head}>
            <span className={styles.headIcon}>
              <Icon name={section.icon} size={26} />
            </span>
            <span>
              <h1 className={styles.title}>{section.title}</h1>
              <p className={styles.sub}>{section.sub}</p>
            </span>
          </div>

          <fieldset className={styles.fieldset} disabled={readonly}>
          {/* ============ 1. INFORMAÇÕES GERAIS ============ */}
          {section.key === "geral" && (
            <div className={styles.form}>
              <Field label="Nome" pref span>
                {In("nome", { iconLeft: <Icon name="user" size={18} /> })}
              </Field>
              <Field label="Sexo">{Sg("sexo", ["Feminino", "Masculino", "Outro"])}</Field>
              <Field label="Data de nascimento">{In("nascimento", { mask: maskDate, inputMode: "numeric", placeholder: "DD/MM/AAAA" })}</Field>
              <Field label="Endereço" span>{In("endereco", { placeholder: "Rua, número, complemento" })}</Field>
              <Field label="CEP">
                <Input
                  value={form.cep || ""}
                  inputMode="numeric"
                  placeholder="00000-000"
                  onChange={(e) => set("cep", maskCEP(e.target.value))}
                  onBlur={(e) => buscarCep(e.target.value)}
                />
              </Field>
              <Field label="Bairro">{In("bairro")}</Field>
              <Field label="Cidade">{In("cidade")}</Field>
              <Field label="CPF">{In("cpf", { mask: maskCPF, inputMode: "numeric", placeholder: "000.000.000-00" })}</Field>
              <Field label="E-mail" pref>
                {In("email", { type: "email", inputMode: "email", iconLeft: <Icon name="mail" size={18} />, placeholder: "nome@email.com" })}
              </Field>
              <Field label="Telefone residencial">
                {In("telResidencial", { mask: maskPhone, type: "tel", inputMode: "numeric", placeholder: "(00) 0000-0000" })}
              </Field>
              <Field label="Celular" pref>
                {In("celular", { mask: maskPhone, type: "tel", inputMode: "numeric", placeholder: "(00) 00000-0000" })}
              </Field>
              <Field label="Nome da mãe" span>{In("nomeMae")}</Field>

              <Field label="Situação conjugal">{In("conjugal")}</Field>
              <Field label="Religião">{In("religiao")}</Field>
              <Field label="Naturalidade">{In("naturalidade")}</Field>
              <Field label="Procedência">{In("procedencia")}</Field>
              <Field label="Motivo da consulta (queixa principal)" span>{Ar("queixa", "O que traz o paciente até a consulta")}</Field>
              <Field label="Ocupação">{In("ocupacao")}</Field>
              <Field label="Carga horária">{HoursIn("cargaHoraria")}</Field>
            </div>
          )}

          {/* ============ 2. CONDIÇÕES SOCIOECONÔMICAS ============ */}
          {section.key === "socio" && (
            <div className={styles.form}>
              <Field label="Renda mensal familiar">
                {In("rendaFamiliar", { mask: maskMoney, inputMode: "numeric", placeholder: "R$ 0,00" })}
              </Field>
              <Field label="Renda destinada à alimentação">
                {In("rendaAlimentacao", { mask: maskMoney, inputMode: "numeric", placeholder: "R$ 0,00" })}
              </Field>
              <Field label="Habitação própria">{Sg("habitacaoPropria", SIMNAO)}</Field>
              <Field label="Animais de estimação">{Sg("animais", SIMNAO)}</Field>
              <Field label="Com quem reside" span>{In("comQuemReside")}</Field>
            </div>
          )}

          {/* ============ 3. ESTILO DE VIDA ============ */}
          {section.key === "estilo" && (
            <div className={styles.form}>
              <Field label="Sono" span>{Sg("sono", SONO)}</Field>
              <Field label="Dorme (h)">{In("dormeH", { type: "time" })}</Field>
              <Field label="Acorda (h)">{In("acordaH", { type: "time" })}</Field>

              <span className={styles.divider} aria-hidden="true" />
              <Field label="Etilismo" span>{Sg("etilismo", SIMNAO)}</Field>
              <Field label="Qual tipo">{In("etilismoTipo")}</Field>
              <Field label="Frequência">{Freq("etilismoFreq")}</Field>
              <Field label="Quantidade">{In("etilismoQtd", { mask: maskNum, inputMode: "numeric", placeholder: "Nº" })}</Field>
              <Field label="Abstêmio">{Sg("etilismoAbstemio", SIMNAO)}</Field>
              <Field label="Há quanto tempo">{In("etilismoTempo")}</Field>

              <span className={styles.divider} aria-hidden="true" />
              <Field label="Tabagismo" span>{Sg("tabagismo", SIMNAO)}</Field>
              <Field label="Tipo">{In("tabagismoTipo")}</Field>
              <Field label="Frequência">{Freq("tabagismoFreq")}</Field>
              <Field label="Quantidade">{In("tabagismoQtd", { mask: maskNum, inputMode: "numeric", placeholder: "Nº" })}</Field>
              <Field label="Abstêmio">{Sg("tabagismoAbstemio", SIMNAO)}</Field>
              <Field label="Há quanto tempo">{In("tabagismoTempo")}</Field>
              <Field label="Fumante passivo">{Sg("fumantePassivo", SIMNAO)}</Field>

              <span className={styles.divider} aria-hidden="true" />
              <Field label="Disposição física">{Sg("disposicao", ESCALA)}</Field>
              <Field label="Piora em algum momento do dia?">{In("disposicaoPiora")}</Field>
              <Field label="Memória">{Sg("memoria", ESCALA)}</Field>
              <Field label="Piora em algum momento do dia?">{In("memoriaPiora")}</Field>
              <Field label="Concentração para atividades">{Sg("concentracao", ESCALA)}</Field>
              <Field label="Piora em algum momento do dia?">{In("concentracaoPiora")}</Field>

              <span className={styles.divider} aria-hidden="true" />
              <Field label="Exercício físico" span>{Sg("exercicio", SIMNAO)}</Field>
              <Field label="Tipo">{In("exercicioTipo")}</Field>
              <Field label="Intensidade">{In("exercicioIntensidade")}</Field>
              <Field label="Frequência">{Freq("exercicioFreq")}</Field>
              <Field label="Horário">{In("exercicioHorario", { type: "time" })}</Field>
              <Field label="Duração">{In("exercicioDuracao")}</Field>
              <Field label="Observação" span>{Ar("exercicioObs", "Observações sobre a prática")}</Field>

              <span className={styles.divider} aria-hidden="true" />
              {ATIV_DIARIA.map((a, i) => {
                const base = `ativ_${a}`;
                return (
                  <div className={styles.colSpan} key={a}>
                    {i > 0 && <span className={styles.divider} aria-hidden="true" />}
                    <div className={styles.subgrid}>
                      <Field label={a}>{In(`${base}_v`)}</Field>
                      <Field label="Frequência">{Freq(`${base}_f`)}</Field>
                      <Field label="Horário">{In(`${base}_h`, { type: "time" })}</Field>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ============ 4. REPRODUÇÃO ============ */}
          {section.key === "reprod" && (
            <div className={styles.form}>
              <Field label="Gestações">{Sg("gestacoes", SIMNAO)}</Field>
              <Field label="Quantas">{In("gestacoesQtd", { type: "number", min: "0" })}</Field>
              <Field label="Abortos">{Sg("abortos", SIMNAO)}</Field>
              <Field label="Ciclo menstrual (dias)">{In("cicloDias", { type: "number", min: "0" })}</Field>
              <Field label="Fluxo">{Sg("fluxo", ["Pouco", "Regular", "Muito"])}</Field>
              <Field label="Cólica menstrual">{Sg("colica", SIMNAO)}</Field>
              <Field label="TPM">{Sg("tpm", SIMNAO)}</Field>
              <Field label="Sintomas da TPM" span>{In("tpmSintomas")}</Field>
            </div>
          )}

          {/* ============ HISTÓRIA PATOLÓGICA FAMILIAR ============ */}
          {section.key === "patolFam" && (
            <div className={styles.form}>
              <Field label="História patológica familiar" span>
                <FamilyInput value={form.familiarHist} onChange={(v) => set("familiarHist", v)} />
              </Field>
            </div>
          )}

          {/* ============ HISTÓRIA PATOLÓGICA (paciente) ============ */}
          {section.key === "patolHist" && (
            <div className={styles.form}>
              <Field label="História patológica pregressa" span>{Ar("patolPregressa", "Doenças anteriores, cirurgias, internações…")}</Field>
              <Field label="História patológica atual" span>{Ar("patolAtual", "Condições de saúde atuais")}</Field>
              <Field label="Medicamentos / Suplementos em uso" span>{Ar("medicamentos", "Quais, dosagem e frequência")}</Field>
            </div>
          )}

          {/* ============ HISTÓRIA NUTRICIONAL (GI + ritmos + hábitos + exame físico) ============ */}
          {/* Aparelho gastrointestinal */}
          {section.key === "gastro" && (
            <div className={styles.form}>
              <div className={styles.colSpan}>
                <div className={styles.chips}>
                  {GI.map((o) => (
                    <button
                      key={o}
                      type="button"
                      className={`${styles.chip} ${has("gi", o) ? styles.chipOn : ""}`}
                      onClick={() => toggle("gi", o)}
                      aria-pressed={has("gi", o)}
                    >
                      <span className={styles.chipBox}>{has("gi", o) && <Icon name="check" size={12} strokeWidth={3} />}</span>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Distensão abdominal — alimento(s)" span>{In("distensaoAlim")}</Field>
              <Field label="Pirose — alimento(s)">{In("piroseAlim")}</Field>
              <Field label="Refluxo — alimento(s)">{In("refluxoAlim")}</Field>
              <Field label="Flatulência">{Sg("flatulencia", ["Normal", "Aumentada"])}</Field>
              <Field label="Flatulência — alimento(s)">{In("flatulenciaAlim")}</Field>
            </div>
          )}

          {/* Ritmo intestinal e urinário */}
          {section.key === "ritmos" && (
            <div className={styles.form}>
              <Field label="Ritmo intestinal">{Sg("intestinoRitmo", ["Normal", "Lento", "Aumentado"])}</Field>
              <Field label="Frequência">{Freq("intestinoFreq")}</Field>
              <Field label="Tipo (Escala de Bristol)">{In("intestinoBristol")}</Field>
              <Field label="Hemorroidas">{Sg("hemorroidas", SIMNAO)}</Field>
              <Field label="Hematoquezia">{Sg("hematoquezia", SIMNAO)}</Field>
              <Field label="Observações" span>{In("intestinoObs")}</Field>

              <span className={styles.divider} aria-hidden="true" />
              <Field label="Ritmo urinário">{Sg("urinarioRitmo", ["Normal", "Lento", "Aumentado"])}</Field>
              <Field label="Frequência">{Freq("urinarioFreq")}</Field>
              <Field label="Tipo (Escala de Armstrong)">{In("urinarioArmstrong")}</Field>
              <Field label="Proteinúria">{Sg("proteinuria", SIMNAO)}</Field>
              <Field label="Observações" span>{In("urinarioObs")}</Field>
            </div>
          )}

          {/* Hábitos alimentares */}
          {section.key === "habitos" && (
            <div className={styles.form}>
              <Field label="Apetite">{Sg("apetite", ["Normal", "Aumentado", "Reduzido"])}</Field>
              <Field label="Mastigação">{Sg("mastigacao", ["Normal", "Lenta", "Rápida"])}</Field>
              <Field label="Motivos" span>{In("habitosMotivos")}</Field>
              <Field label="Alergia alimentar" span>{In("alergia")}</Field>
              <Field label="Intolerância alimentar" span>{In("intolerancia")}</Field>
              <Field label="Aversão alimentar" span>{In("aversao")}</Field>
              <Field label="Preferências alimentares" span>{In("preferencias")}</Field>
            </div>
          )}

          {/* Exame físico / Semiologia */}
          {section.key === "exame" && (
            <div className={styles.form}>
              {SEMIO.map((s) => (
                <Field key={s} label={s} span>
                  {In(`semio_${s}`)}
                </Field>
              ))}
            </div>
          )}

          {/* ============ 10. EXAMES BIOQUÍMICOS ============ */}
          {section.key === "bioq" && (
            <div className={styles.form}>
              <Field label="Data">{In("bioqData", { type: "date" })}</Field>
              <Field label="Laboratório">{In("bioqLab")}</Field>
              <div className={styles.examesGrid}>
                {EXAMES.map((ex) => (
                  <div className={styles.exRow} key={ex}>
                    <span className={styles.exName}>{ex}</span>
                    <input
                      className={styles.cellInput}
                      placeholder="Encontrado"
                      value={form[`ex_${ex}_enc`] || ""}
                      onChange={(e) => set(`ex_${ex}_enc`, e.target.value)}
                    />
                    <input
                      className={styles.cellInput}
                      placeholder="Referência"
                      value={form[`ex_${ex}_ref`] || ""}
                      onChange={(e) => set(`ex_${ex}_ref`, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <Field label="Demais exames (adicione)" span>
                <ExamesInput value={form.examesDemais} onChange={(v) => set("examesDemais", v)} />
              </Field>
            </div>
          )}

          {/* ============ 11. RECORDATÓRIO ALIMENTAR HABITUAL ============ */}
          {section.key === "record" && (
            <div className={styles.form}>
              <Field label="Refeições do dia (adicione cada uma)" span>
                <MealsInput value={form.refeicoesList} onChange={(v) => set("refeicoesList", v)} />
              </Field>
              <Field label="Alimentação aos finais de semana" span>{Ar("recFds", "Como muda nos fins de semana")}</Field>
              <Field label="Ingestão hídrica diária">{In("recHidrica", { placeholder: "Ex.: 2 L" })}</Field>
              <Field label="Ingere líquidos durante a refeição?">{Sg("recLiquidos", SIMNAO)}</Field>
              <Field label="Qual(is)?" span>{In("recLiquidosQuais")}</Field>
            </div>
          )}

          {/* ============ 12. FREQUÊNCIA ALIMENTAR ============ */}
          {section.key === "freq" && (
            <div className={styles.form}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th rowSpan={2}>Alimento</th>
                      <th colSpan={2}>Diário</th>
                      <th colSpan={3}>Semanal</th>
                      <th colSpan={3}>Mensal</th>
                      <th rowSpan={2}>Nunca</th>
                    </tr>
                    <tr>
                      <th>1-2x</th>
                      <th>≥3x</th>
                      <th>1x</th>
                      <th>2x</th>
                      <th>3-4x</th>
                      <th>1x</th>
                      <th>2x</th>
                      <th>≥3x</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FREQ_FOODS.map((food) => (
                      <tr key={food}>
                        <td>{food}</td>
                        {FREQ_COLS.map((c) => (
                          <td key={c}>
                            <button
                              type="button"
                              aria-label={`${food} ${c}`}
                              className={`${styles.cellBtn} ${form[`freq_${food}`] === c ? styles.cellOn : ""}`}
                              onClick={() => set(`freq_${food}`, c)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Field label="Outros (especificar)" span>{In("freqOutros")}</Field>
              <Field label="Tipo de óleo/gordura usado no preparo" span>{Sg("oleo", OLEO)}</Field>
              <Field label="Come a gordura visível da carne?" span>{Sg("gorduraVisivel", FREQ_ESCALA)}</Field>
              <Field label="Come a pele do frango?" span>{Sg("peleFrango", FREQ_ESCALA)}</Field>
              <Field label="Acrescenta sal na comida depois de pronta?" span>{Sg("salPronto", FREQ_ESCALA)}</Field>
            </div>
          )}

          {/* ============ 13. AVALIAÇÃO ANTROPOMÉTRICA ============ */}
          {section.key === "antro" && (
            <div className={styles.form}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Medida</th>
                      {[0, 1, 2, 3].map((c) => (
                        <th key={c}>
                          <input
                            className={styles.cellInput}
                            type="date"
                            value={form[`antro_data_${c}`] || ""}
                            onChange={(e) => set(`antro_data_${c}`, e.target.value)}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ANTRO_ROWS.map((row, r) => (
                      <tr key={row}>
                        <td>{row}</td>
                        {[0, 1, 2, 3].map((c) =>
                          ANTRO_AUTO[r] ? (
                            <td key={c}>
                              <input
                                className={`${styles.cellInput} ${styles.cellAuto}`}
                                value={antroCalc(r, c)}
                                readOnly
                                tabIndex={-1}
                                placeholder="—"
                              />
                            </td>
                          ) : (
                            <td key={c}>
                              <input
                                className={styles.cellInput}
                                inputMode="decimal"
                                value={form[`antro_${r}_${c}`] || ""}
                                onChange={(e) => set(`antro_${r}_${c}`, maskDecimal(e.target.value))}
                              />
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ 14. DIAGNÓSTICO E OBJETIVOS ============ */}
          {section.key === "final" && (
            <div className={styles.form}>
              <Field label="Diagnóstico nutricional" span>{Ar("diagnostico", "Diagnóstico a partir da avaliação")}</Field>
              <Field label="Objetivos da intervenção nutricional" span>{Ar("objetivos", "Metas e conduta")}</Field>
              <Field label="Evolução nutricional" span>{Ar("evolucao", "Acompanhamento e evolução")}</Field>
            </div>
          )}
          </fieldset>

          <div className={styles.actions}>
            {saveError && (
              <span className={styles.saveError}>
                <Icon name="help" size={16} /> {saveError}
              </span>
            )}
            <Button
              onClick={next}
              loading={saving}
              iconRight={<Icon name={isLast && !readonly ? "check" : isLast ? "close" : "arrowRight"} size={18} />}
            >
              {readonly ? (isLast ? "Fechar" : "Próximo") : isLast ? "Concluir anamnese" : "Próximo"}
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function TagInput({ value = [], onChange, placeholder }) {
  const [text, setText] = useState("");
  const list = Array.isArray(value) ? value : [];

  function add() {
    const t = text.trim();
    if (!t) return;
    onChange([...list, t]);
    setText("");
  }

  return (
    <div className={styles.tagInput}>
      <div className={styles.tagRow}>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <button type="button" className={styles.tagAdd} onClick={add} aria-label="Adicionar">
          <Icon name="plus" size={20} strokeWidth={2.2} />
        </button>
      </div>
      {list.length > 0 && (
        <div className={styles.tagList}>
          {list.map((t, i) => (
            <span className={styles.tag} key={`${t}-${i}`}>
              {t}
              <button
                type="button"
                className={styles.tagRemove}
                onClick={() => onChange(list.filter((_, idx) => idx !== i))}
                aria-label={`Remover ${t}`}
              >
                <Icon name="close" size={14} strokeWidth={2.4} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FamilyInput({ value = [], onChange }) {
  const [cond, setCond] = useState("");
  const [fam, setFam] = useState("");
  const [obs, setObs] = useState("");
  const list = Array.isArray(value) ? value : [];

  function add() {
    const c = cond.trim();
    if (!c) return;
    onChange([...list, { cond: c, fam: fam.trim(), obs: obs.trim() }]);
    setCond("");
    setFam("");
    setObs("");
  }

  const onEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className={styles.tagInput}>
      <div className={styles.famRow}>
        <Input value={cond} placeholder="Condição (ex.: Diabetes)" onChange={(e) => setCond(e.target.value)} onKeyDown={onEnter} />
        <Input value={fam} placeholder="Familiar (ex.: mãe)" onChange={(e) => setFam(e.target.value)} onKeyDown={onEnter} />
        <Input value={obs} placeholder="Observação" onChange={(e) => setObs(e.target.value)} onKeyDown={onEnter} />
        <button type="button" className={styles.tagAdd} onClick={add} aria-label="Adicionar">
          <Icon name="plus" size={20} strokeWidth={2.2} />
        </button>
      </div>
      {list.length > 0 && (
        <div className={styles.famList}>
          {list.map((item, i) => {
            const it = typeof item === "string" ? { cond: item } : item;
            return (
              <div className={styles.famItem} key={`${it.cond}-${i}`}>
                <span className={styles.famItemBody}>
                  <span className={styles.famItemMain}>
                    <strong>{it.cond}</strong>
                    {it.fam ? ` — ${it.fam}` : ""}
                  </span>
                  {it.obs ? <span className={styles.famItemObs}>{it.obs}</span> : null}
                </span>
                <button
                  type="button"
                  className={styles.tagRemove}
                  onClick={() => onChange(list.filter((_, idx) => idx !== i))}
                  aria-label="Remover"
                >
                  <Icon name="close" size={14} strokeWidth={2.4} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExamesInput({ value = [], onChange }) {
  const [ex, setEx] = useState("");
  const [enc, setEnc] = useState("");
  const [ref, setRef] = useState("");
  const list = Array.isArray(value) ? value : [];

  function add() {
    const e = ex.trim();
    if (!e) return;
    onChange([...list, { ex: e, enc: enc.trim(), ref: ref.trim() }]);
    setEx("");
    setEnc("");
    setRef("");
  }

  const onEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className={styles.tagInput}>
      <div className={styles.famRow}>
        <Input value={ex} placeholder="Exame" onChange={(e) => setEx(e.target.value)} onKeyDown={onEnter} />
        <Input value={enc} placeholder="Encontrado" onChange={(e) => setEnc(e.target.value)} onKeyDown={onEnter} />
        <Input value={ref} placeholder="Referência" onChange={(e) => setRef(e.target.value)} onKeyDown={onEnter} />
        <button type="button" className={styles.tagAdd} onClick={add} aria-label="Adicionar">
          <Icon name="plus" size={20} strokeWidth={2.2} />
        </button>
      </div>
      {list.length > 0 && (
        <div className={styles.famList}>
          {list.map((it, i) => (
            <div className={styles.famItem} key={`${it.ex}-${i}`}>
              <span className={styles.famItemBody}>
                <span className={styles.famItemMain}>
                  <strong>{it.ex}</strong>
                </span>
                {(it.enc || it.ref) && (
                  <span className={styles.famItemObs}>
                    {[it.enc && `Encontrado: ${it.enc}`, it.ref && `Ref.: ${it.ref}`].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
              <button
                type="button"
                className={styles.tagRemove}
                onClick={() => onChange(list.filter((_, idx) => idx !== i))}
                aria-label="Remover"
              >
                <Icon name="close" size={14} strokeWidth={2.4} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MealsInput({ value, onChange }) {
  const EMPTY_FOOD = { alimento: "", qtd: "", obs: "" };
  const getFoods = (m) => (m.foods && m.foods.length ? m.foods : [{ ...EMPTY_FOOD }]);
  const list = Array.isArray(value) && value.length ? value : [{ ref: "", hora: "", local: "", foods: [{ ...EMPTY_FOOD }] }];

  const updateMeal = (i, k, v) => onChange(list.map((m, idx) => (idx === i ? { ...m, [k]: v } : m)));
  const updateFood = (mi, fi, k, v) =>
    onChange(list.map((m, idx) => (idx === mi ? { ...m, foods: getFoods(m).map((f, j) => (j === fi ? { ...f, [k]: v } : f)) } : m)));
  const addMeal = () => onChange([...list, { ref: "", hora: "", local: "", foods: [{ ...EMPTY_FOOD }] }]);
  const removeMeal = (i) => onChange(list.filter((_, idx) => idx !== i));
  const addFood = (mi) => onChange(list.map((m, idx) => (idx === mi ? { ...m, foods: [...getFoods(m), { ...EMPTY_FOOD }] } : m)));
  const removeFood = (mi, fi) => onChange(list.map((m, idx) => (idx === mi ? { ...m, foods: getFoods(m).filter((_, j) => j !== fi) } : m)));

  return (
    <div className={styles.mealsInput}>
      {list.map((m, i) => (
        <Fragment key={i}>
          {i > 0 && <span className={styles.divider} aria-hidden="true" />}
          <div className={styles.mealItem}>
            {list.length > 1 && (
              <div className={styles.mealRemoveRow}>
                <button type="button" className={styles.mealRemove} onClick={() => removeMeal(i)}>
                  <Icon name="trash" size={15} /> Remover refeição
                </button>
              </div>
            )}
            <div className={styles.mealFormGrid}>
              <Field label="Refeição">
                <Input value={m.ref || ""} placeholder="Ex.: Almoço" onChange={(e) => updateMeal(i, "ref", e.target.value)} />
              </Field>
              <Field label="Horário">
                <Input type="time" value={m.hora || ""} onChange={(e) => updateMeal(i, "hora", e.target.value)} />
              </Field>
              <Field label="Local">
                <Input value={m.local || ""} placeholder="Ex.: Casa" onChange={(e) => updateMeal(i, "local", e.target.value)} />
              </Field>
            </div>

            <div className={styles.foods}>
              <span className={styles.fieldLabel}>Alimentos (alimento · quantidade · observação)</span>
              {getFoods(m).map((f, fi) => (
                <div className={styles.foodRow} key={fi}>
                  <Input value={f.alimento || ""} placeholder="Alimento" onChange={(e) => updateFood(i, fi, "alimento", e.target.value)} />
                  <Input value={f.qtd || ""} placeholder="Quantidade" onChange={(e) => updateFood(i, fi, "qtd", e.target.value)} />
                  <Input value={f.obs || ""} placeholder="Observação" onChange={(e) => updateFood(i, fi, "obs", e.target.value)} />
                  {getFoods(m).length > 1 ? (
                    <button type="button" className={styles.foodRemove} onClick={() => removeFood(i, fi)} aria-label="Remover alimento">
                      <Icon name="close" size={16} strokeWidth={2.4} />
                    </button>
                  ) : (
                    <span className={styles.foodSpacer} />
                  )}
                </div>
              ))}
              <button type="button" className={styles.foodAdd} onClick={() => addFood(i)}>
                <Icon name="plus" size={16} /> Adicionar alimento
              </button>
            </div>
          </div>
        </Fragment>
      ))}
      <button type="button" className={styles.mealAdd} onClick={addMeal}>
        <Icon name="plus" size={18} />
        Adicionar refeição
      </button>
    </div>
  );
}

function Field({ label, span, children }) {
  // <div> (não <label>): um <label> englobando botões faz cliques em áreas não
  // interativas dispararem o primeiro botão interno (ex.: "Remover refeição"),
  // apagando dados do formulário sem o usuário perceber.
  return (
    <div className={`${styles.field} ${span ? styles.colSpan : ""}`}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </div>
  );
}

// useSearchParams precisa de um boundary de Suspense no build do Next (App Router).
export default function AnamnesePage() {
  return (
    <Suspense fallback={null}>
      <AnamneseInner />
    </Suspense>
  );
}
