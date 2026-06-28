"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

import AppShell from "@/components/organisms/AppShell/AppShell";
import Card from "@/components/atoms/Card/Card";
import Icon from "@/components/atoms/Icon/Icon";
import Input from "@/components/atoms/Input/Input";
import Button from "@/components/atoms/Button/Button";
import FinishFlow from "@/components/molecules/FinishFlow/FinishFlow";
import { apiPost } from "@/lib/api";

const SEX_MAP = { Feminino: "female", Masculino: "male", Outro: "other" };

const STEPS = ["Dados", "Anamnese", "Concluído"];
const SEXOS = ["Feminino", "Masculino", "Outro"];

const onlyDigits = (v) => (v || "").replace(/\D/g, "");
const maskPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};
const maskDate = (v) => {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
};
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());

function ageFrom(dateStr) {
  const m = (dateStr || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const b = new Date(yyyy, mm - 1, dd);
  if (b.getFullYear() !== yyyy || b.getMonth() !== mm - 1 || b.getDate() !== dd) return null;
  const now = new Date();
  let a = now.getFullYear() - yyyy;
  if (now.getMonth() < mm - 1 || (now.getMonth() === mm - 1 && now.getDate() < dd)) a -= 1;
  return a >= 0 && a < 130 ? a : null;
}

function Field({ label, hint, span, children }) {
  return (
    <label className={`${styles.field} ${span ? styles.colSpan : ""}`}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
      {hint && <span className={styles.fieldHint}>{hint}</span>}
    </label>
  );
}

export default function NovoPacientePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState(null); // "now" | "later" (confirmado)
  const [pick, setPick] = useState("now"); // seleção atual no step de anamnese
  const [errors, setErrors] = useState({});
  const [showTip, setShowTip] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [created, setCreated] = useState(null); // { profileId, tempPassword }
  const [animDone, setAnimDone] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    nascimento: "",
    sexo: "",
    telefone: "",
    email: ""
  });

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: false } : e));
    setShowTip(false);
  };

  const age = ageFrom(form.nascimento);
  const tipo = age == null ? null : age >= 60 ? "idoso" : "adulto";
  const primeiroNome = form.nome.trim().split(" ")[0] || "paciente";

  function step1Errors() {
    const e = {};
    if (form.nome.trim().length < 2) e.nome = true;
    if (ageFrom(form.nascimento) == null) e.nascimento = true;
    if (!form.sexo) e.sexo = true;
    // Telefone e e-mail são opcionais, mas ao menos um é obrigatório.
    const hasPhone = onlyDigits(form.telefone).length >= 10;
    const hasEmail = emailOk(form.email);
    if (form.telefone && !hasPhone) e.telefone = true;
    if (form.email && !hasEmail) e.email = true;
    if (!hasPhone && !hasEmail) {
      e.contato = true;
      if (!form.telefone) e.telefone = true;
      if (!form.email) e.email = true;
    }
    return e;
  }

  function continuar() {
    const e = step1Errors();
    setErrors(e);
    if (Object.keys(e).length) {
      setShowTip(true);
      return;
    }
    setShowTip(false);
    setStep(1);
  }

  function continuarAnamnese() {
    if (!pick) return;
    setChoice(pick);
    setAnimDone(false);
    setCreated(null);
    setCreateError(null);
    setStep(2);
    createPatient();
  }

  async function createPatient() {
    setCreating(true);
    setCreateError(null);
    try {
      const m = form.nascimento.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      const birthDate = m ? `${m[3]}-${m[2]}-${m[1]}` : null;
      const body = {
        name: form.nome.trim(),
        profile: { birthDate, sex: SEX_MAP[form.sexo] || null }
      };
      if (emailOk(form.email)) body.email = form.email.trim();
      if (onlyDigits(form.telefone).length >= 10) body.phone = onlyDigits(form.telefone);
      const res = await apiPost("/users/patients", body);
      const profileId = res && res.user && res.user.profile && res.user.profile.id;
      setCreated({ profileId, tempPassword: (res && res.tempPasswordIssued) || null });
    } catch (e) {
      setCreateError(e && e.message ? e.message : "Não foi possível cadastrar o paciente.");
    } finally {
      setCreating(false);
    }
  }

  function goToAnamnese(profileId) {
    try {
      sessionStorage.setItem(
        "bn_anamnese_patient",
        JSON.stringify({ patientProfileId: profileId, nome: form.nome, sexo: form.sexo, nascimento: form.nascimento })
      );
      localStorage.removeItem("bn_anamnese_draft");
    } catch {
      /* ignora */
    }
    router.push(`/anamnese?patient=${profileId || ""}`);
  }

  // Conclui quando a animação termina E o paciente foi criado na API.
  useEffect(() => {
    if (step !== 2 || !animDone || !created || createError) return;
    if (choice === "now") goToAnamnese(created.profileId);
    else setFinalized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, animDone, created, createError, choice]);

  const hasEmail = emailOk(form.email);
  const hasPhone = onlyDigits(form.telefone).length >= 10;
  const finishSteps = [
    { icon: "users", phrase: `Criando a conta de ${primeiroNome}…` },
    hasEmail ? { icon: "mail", phrase: "Enviando o e-mail de acesso…" } : { icon: "lock", phrase: "Preparando o acesso…" },
    { icon: "check", phrase: choice === "now" ? "Tudo pronto! Vamos à anamnese 🎉" : "Tudo pronto! 🎉" }
  ];
  const doneMessage = hasEmail
    ? "Conta criada e acesso enviado por e-mail. A anamnese será feita na consulta."
    : "Conta criada. Compartilhe o acesso com o paciente — a anamnese será feita na consulta.";

  return (
    <AppShell active="pacientes" title="Cadastrar paciente">
      <div className={styles.page}>
        {/* Stepper */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <Step key={s} index={i} label={s} step={step} last={i === STEPS.length - 1} />
          ))}
        </div>

        {/* Step 1 — Dados */}
        {step === 0 && (
          <Card elevation="sm" padding="lg">
            <div className={styles.head}>
              <h1 className={styles.title}>Dados do paciente</h1>
              <p className={styles.sub}>Informações básicas para iniciar o acompanhamento.</p>
            </div>

            <div className={styles.form}>
              <Field label="Nome completo" span>
                <Input
                  placeholder="Ex.: Maria Silva"
                  iconLeft={<Icon name="user" size={18} />}
                  value={form.nome}
                  warn={!!errors.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  autoFocus
                />
              </Field>

              <Field label="Data de nascimento" hint={tipo ? `${age} anos · anamnese de ${tipo}` : undefined}>
                <Input
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  iconLeft={<Icon name="calendar" size={18} />}
                  value={form.nascimento}
                  warn={!!errors.nascimento}
                  onChange={(e) => set("nascimento", maskDate(e.target.value))}
                />
              </Field>

              <Field label="Sexo">
                <div className={`${styles.segment} ${errors.sexo ? styles.segmentWarn : ""}`} role="group" aria-label="Sexo">
                  {SEXOS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.segItem} ${form.sexo === s ? styles.segActive : ""}`}
                      onClick={() => set("sexo", s)}
                      aria-pressed={form.sexo === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Telefone / WhatsApp" hint="E-mail ou telefone — ao menos um.">
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="(11) 90000-0000"
                  iconLeft={<Icon name="chat" size={18} />}
                  value={form.telefone}
                  warn={!!errors.telefone}
                  onChange={(e) => set("telefone", maskPhone(e.target.value))}
                />
              </Field>

              <Field label="E-mail">
                <Input
                  type="email"
                  inputMode="email"
                  placeholder="maria@email.com"
                  iconLeft={<Icon name="mail" size={18} />}
                  value={form.email}
                  warn={!!errors.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
            </div>

            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                Cancelar
              </Button>
              {showTip && (
                <span className={styles.tip}>
                  <Icon name="help" size={16} />{" "}
                  {errors.contato ? "Informe ao menos e-mail ou telefone." : "Preencha os campos corretamente."}
                </span>
              )}
              <Button onClick={continuar} iconRight={<Icon name="arrowRight" size={18} />}>
                Continuar
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2 — Anamnese agora ou depois */}
        {step === 1 && (
          <Card elevation="sm" padding="lg">
            <div className={styles.head}>
              <h1 className={styles.title}>Anamnese</h1>
              <p className={styles.sub}>
                <strong>{primeiroNome}</strong> já está no consultório, ou é um cadastro antecipado?
              </p>
            </div>

            <div className={styles.typeBanner}>
              <span className={styles.typeBannerIcon}>
                <Icon name="clipboard" size={24} />
              </span>
              <span className={styles.typeBannerText}>
                <span className={styles.typeBannerLabel}>Tipo de anamnese</span>
                <span className={styles.typeBannerValue}>Anamnese de {tipo || "adulto"}</span>
              </span>
            </div>

            <div className={styles.choices}>
              <button
                type="button"
                className={`${styles.choice} ${pick === "now" ? styles.choiceSelected : ""}`}
                onClick={() => setPick("now")}
                aria-pressed={pick === "now"}
              >
                <span className={styles.choiceCheck}>{pick === "now" && <Icon name="check" size={16} strokeWidth={2.6} />}</span>
                <span className={styles.choiceIcon}>
                  <Icon name="clipboard" size={30} />
                </span>
                <span className={styles.choiceTitle}>Fazer agora</span>
                <span className={styles.choiceSub}>O paciente está na consulta agora — vamos preencher a anamnese juntos.</span>
              </button>

              <button
                type="button"
                className={`${styles.choice} ${pick === "later" ? styles.choiceSelected : ""}`}
                onClick={() => setPick("later")}
                aria-pressed={pick === "later"}
              >
                <span className={styles.choiceCheck}>{pick === "later" && <Icon name="check" size={16} strokeWidth={2.6} />}</span>
                <span className={styles.choiceIcon}>
                  <Icon name="clock" size={30} />
                </span>
                <span className={styles.choiceTitle}>Cadastro antecipado</span>
                <span className={styles.choiceSub}>Só adiantando o cadastro (ex.: peguei os dados pelo WhatsApp). A anamnese é feita na consulta.</span>
              </button>
            </div>

            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => setStep(0)} iconLeft={<Icon name="chevronLeft" size={18} />}>
                Voltar
              </Button>
              <Button onClick={continuarAnamnese} disabled={!pick} iconRight={<Icon name="arrowRight" size={18} />}>
                Continuar
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3 — Finalizando / Concluído */}
        {step === 2 && (
          <Card elevation="sm" padding="lg">
            {createError ? (
              <div className={styles.done}>
                <span className={`${styles.doneIcon} ${styles.doneIconError}`}>
                  <Icon name="help" size={36} strokeWidth={2.2} />
                </span>
                <h1 className={styles.doneTitle}>Não foi possível cadastrar</h1>
                <p className={styles.doneSub}>{createError}</p>
                <div className={styles.doneActions}>
                  <Button
                    onClick={() => {
                      setCreateError(null);
                      setAnimDone(false);
                      createPatient();
                    }}
                  >
                    Tentar de novo
                  </Button>
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                </div>
              </div>
            ) : choice === "later" && finalized ? (
              <div className={styles.done}>
                <span className={styles.doneIcon}>
                  <Icon name="check" size={36} strokeWidth={2.4} />
                </span>
                <h1 className={styles.doneTitle}>{primeiroNome} cadastrado!</h1>
                <p className={styles.doneSub}>{doneMessage}</p>
                {created && created.tempPassword && (
                  <div className={styles.tempPass}>
                    <Icon name="lock" size={16} /> Senha provisória: <strong>{created.tempPassword}</strong>
                  </div>
                )}
                <div className={styles.doneActions}>
                  <Button onClick={() => router.push("/pacientes")} iconRight={<Icon name="arrowRight" size={18} />}>
                    Ver pacientes
                  </Button>
                  <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                    Voltar ao início
                  </Button>
                </div>
              </div>
            ) : (
              <FinishFlow steps={finishSteps} onDone={() => setAnimDone(true)} />
            )}
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function Step({ index, label, step, last }) {
  const cls = [styles.step, index === step ? styles.stepActive : "", index < step ? styles.stepDone : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <>
      <div className={cls}>
        <span className={styles.stepDot}>{index < step ? <Icon name="check" size={15} strokeWidth={2.6} /> : index + 1}</span>
        <span className={styles.stepLabel}>{label}</span>
      </div>
      {!last && <span className={`${styles.stepBar} ${index < step ? styles.stepBarDone : ""}`} />}
    </>
  );
}
