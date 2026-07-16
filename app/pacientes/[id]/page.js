"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";

import AppShell from "@/components/organisms/AppShell/AppShell";
import Card from "@/components/atoms/Card/Card";
import Icon from "@/components/atoms/Icon/Icon";
import Button from "@/components/atoms/Button/Button";
import Fruit from "@/components/atoms/Fruit/Fruit";
import Chat from "@/components/organisms/Chat/Chat";
import PlanoView from "@/components/organisms/PlanoView/PlanoView";
import PhotoEditor from "@/components/molecules/PhotoEditor/PhotoEditor";
import Skeleton from "@/components/atoms/Skeleton/Skeleton";
import EmptyState from "@/components/molecules/EmptyState/EmptyState";
import Modal from "@/components/molecules/Modal/Modal";
import { useUpload } from "@/components/providers/UploadProvider";
import { apiGet, apiPost, apiPatch, apiDelete, getCurrentUser } from "@/lib/api";
import { categorizeShopping, ingredientsFromMeals } from "@/lib/shopping";

const SEX_LABEL = { male: "Masculino", female: "Feminino", other: "Outro" };
const pad = (n) => String(n).padStart(2, "0");

function initials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
function ageFrom(birthDate) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a -= 1;
  return a >= 0 && a < 130 ? a : null;
}
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function humanize(k) {
  return k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
function mapMsg(m, myId) {
  const d = new Date(m.createdAt);
  return {
    id: m.id,
    from: m.senderId === myId ? "me" : "them",
    type: m.type || "text",
    text: m.body || "",
    src: m.attachmentUrl || undefined,
    name: m.attachmentName || undefined,
    size: m.attachmentSize || undefined,
    duration: m.durationSec || undefined,
    time: Number.isNaN(d.getTime()) ? "" : `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}
function mapPlan(dp) {
  if (!dp) return null;
  const num = (v) => Math.round(Number(v) || 0);
  const meals = (dp.meals || []).map((m) => ({
    time: (m.preferredTime || "").slice(0, 5),
    name: m.name,
    kcal: num(m.kcal),
    macros: { c: num(m.carbsG), p: num(m.proteinG), l: num(m.fatG) },
    foods: (m.items || []).map((it) => ({
      name: it.customFoodName || (it.food && it.food.name) || "Alimento",
      qty: it.quantityLabel || `${Number(it.quantity) || ""}${it.unit || ""}`,
      subs: (it.substitutions || []).map((s) => (s && s.name ? `${s.name}${s.qty ? ` — ${s.qty}` : ""}` : String(s))),
    })),
  }));
  // Lista de compras: ingredientes do plano agrupados por categoria (igual ao app).
  const shoppingSource =
    Array.isArray(dp.shoppingItems) && dp.shoppingItems.length ? dp.shoppingItems : ingredientsFromMeals(dp.meals);
  const shopping = categorizeShopping(shoppingSource);
  return {
    prescritoEm: fmtDate(dp.createdAt),
    totals: { kcal: num(dp.targetKcal), c: num(dp.targetCarbsG), p: num(dp.targetProteinG), l: num(dp.targetFatG) },
    meals,
    recipes: (dp.recipes || []).map((r) => ({ name: r.name, yield: r.yield, ingredients: r.ingredients, steps: r.steps })),
    shopping,
    purchases: [],
    diary: [],
  };
}
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function DataItem({ label, value }) {
  return (
    <span className={styles.dataItem}>
      <span className={styles.dataLabel}>{label}</span>
      <span className={styles.dataValue}>{value || "—"}</span>
    </span>
  );
}

function UploadProgress({ up }) {
  return (
    <div className={styles.upBox}>
      <div className={styles.upHead}>
        <span className={styles.upSpinner} aria-hidden="true" />
        <span className={styles.upTitle}>Importando plano alimentar…</span>
        <span className={styles.upPct}>{Math.round(up.progress)}%</span>
      </div>
      <div className={styles.upBar}>
        <span className={styles.upFill} style={{ "--p": `${up.progress}%` }} />
      </div>
      <span className={styles.upHint}>Pode sair desta página — avisamos quando terminar. 🍃</span>
    </div>
  );
}

export default function PerfilPaciente() {
  const router = useRouter();
  const id = useParams().id;

  const [me] = useState(() => (typeof window !== "undefined" ? getCurrentUser() : null));
  const [profile, setProfile] = useState(null); // null = carregando
  const [error, setError] = useState(null);
  const [anamnesis, setAnamnesis] = useState(undefined); // undefined=carregando, null=nenhuma
  const [plan, setPlan] = useState(undefined); // undefined=carregando, null=nenhum
  const [tab, setTab] = useState("geral");
  const [obs, setObs] = useState("");
  const [obsSaved, setObsSaved] = useState(false);
  const [savingObs, setSavingObs] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { uploads, startImport } = useUpload();
  const up = uploads[id];
  const [conv, setConv] = useState(null);
  const [msgs, setMsgs] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [editorSrc, setEditorSrc] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const fileRef = useRef(null);
  const photoRef = useRef(null);

  useEffect(() => {
    try {
      const ph = localStorage.getItem(`bn_foto_${id}`);
      setPhoto(ph || null);
    } catch {
      /* ignora */
    }
  }, [id]);

  function onPhoto(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setEditorSrc(String(reader.result));
    reader.readAsDataURL(f);
  }
  function savePhoto(data) {
    setPhoto(data);
    try {
      localStorage.setItem(`bn_foto_${id}`, data);
    } catch {
      /* ignora */
    }
    setEditorSrc(null);
  }

  async function loadProfile() {
    setError(null);
    setProfile(null);
    try {
      const p = await apiGet(`/users/profiles/${id}`);
      setProfile(p);
      setObs(p.clinicalNotes || "");
    } catch (e) {
      setError(e && e.message ? e.message : "Paciente não encontrado.");
    }
  }

  useEffect(() => {
    loadProfile();
    apiGet(`/anamnesis/${id}`)
      .then((a) => setAnamnesis(a || null))
      .catch(() => setAnamnesis(null));
    apiGet(`/diet-plans?patientProfileId=${id}`)
      .then(async (list) => {
        if (Array.isArray(list) && list.length) {
          const full = await apiGet(`/diet-plans/${list[0].id}`);
          setPlan(mapPlan(full));
        } else {
          setPlan(null);
        }
      })
      .catch(() => setPlan(null));
    // conversa do chat
    apiPost("/conversations", { patientProfileId: id })
      .then((c) => {
        setConv(c);
        return apiGet(`/conversations/${c.id}/messages`);
      })
      .then((list) => setMsgs((Array.isArray(list) ? list : []).map((m) => mapMsg(m, me && me.id))))
      .catch(() => setMsgs([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const anamneseStatus = anamnesis === undefined ? "loading" : anamnesis ? anamnesis.status : null;

  function openAnamnese() {
    if (anamneseStatus === "completed") router.push(`/anamnese?patient=${id}&view=1`);
    else router.push(`/anamnese?patient=${id}`);
  }

  async function deletePatient() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiDelete(`/users/profiles/${id}`);
      try {
        localStorage.removeItem(`bn_foto_${id}`);
      } catch {
        /* ignora */
      }
      router.push("/pacientes");
    } catch (e) {
      setDeleteError(e && e.message ? e.message : "Não foi possível excluir o paciente.");
      setDeleting(false);
    }
  }

  async function saveObs() {
    setSavingObs(true);
    try {
      await apiPatch(`/users/profiles/${id}`, { clinicalNotes: obs });
      setObsSaved(true);
      setTimeout(() => setObsSaved(false), 1800);
    } catch {
      /* ignora */
    } finally {
      setSavingObs(false);
    }
  }

  function handleFile(f) {
    if (!f) return;
    if (f.type && f.type !== "application/pdf" && !/\.pdf$/i.test(f.name || "")) return; // só PDF
    const nm = (profile && profile.user && profile.user.name) || "paciente";
    startImport(id, f, { patientName: nm }); // roda em background no provider
  }
  function onPlanoFile(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    handleFile(f);
  }
  function onDragOver(e) {
    e.preventDefault();
    if (!dragOver) setDragOver(true);
  }
  function onDragLeave(e) {
    e.preventDefault();
    // só desativa ao sair de fato da zona (não ao passar sobre os filhos)
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOver(false);
  }
  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
  }

  // Quando o import (mesmo iniciado e deixado em background) conclui, aplica o plano.
  useEffect(() => {
    if (up && up.status === "done" && up.plan) setPlan(mapPlan(up.plan));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [up && up.status]);

  async function handleSend(msg) {
    if (!conv || !msg || msg.type !== "text") return;
    try {
      await apiPost(`/conversations/${conv.id}/messages`, { type: "text", body: msg.text });
    } catch {
      /* já apareceu localmente */
    }
  }

  // ---------- loading / erro ----------
  if (error) {
    return (
      <AppShell active="pacientes" title="Paciente">
        <div className={styles.page}>
          <EmptyState
            variant="error"
            icon="help"
            title="Paciente não encontrado"
            message={error}
            action={
              <Button onClick={() => router.push("/pacientes")} iconLeft={<Icon name="chevronLeft" size={18} />}>
                Voltar aos pacientes
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }
  if (!profile) {
    return (
      <AppShell active="pacientes" title="Paciente">
        <div className={styles.page}>
          <div className={styles.banner}>
            <div className={styles.bannerContent}>
              <Skeleton circle width={96} height={96} />
              <div className={styles.bannerInfo}>
                <Skeleton width={180} height={26} />
                <Skeleton width={260} height={14} />
              </div>
            </div>
          </div>
          <div className={styles.grid}>
            <div className={styles.colMain}>
              <Card elevation="sm" padding="lg">
                <div className={styles.loadingStack}>
                  <Skeleton width="40%" height={18} />
                  <Skeleton width="100%" height={14} />
                  <Skeleton width="80%" height={14} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const name = (profile.user && profile.user.name) || "Paciente";
  const email = (profile.user && profile.user.email) || "—";
  const age = ageFrom(profile.birthDate);
  const sexo = SEX_LABEL[profile.sex] || "—";
  const restr = profile.restrictions || [];
  const gi = anamnesis && anamnesis.generalInfo ? anamnesis.generalInfo : null;
  const snapshot = gi
    ? Object.entries(gi).filter(([, v]) => typeof v === "string" && v.trim()).map(([k, v]) => ({ label: humanize(k), value: v }))
    : [];

  return (
    <AppShell active="pacientes" title={`Paciente: ${name}`}>
      <div className={styles.page}>
        {/* Banner */}
        <div className={styles.banner}>
          <span className={styles.bannerGlow} />
          <Fruit name="morango" fallback="strawberry" size={52} className={`${styles.bannerFruit} ${styles.bf1}`} />
          <Fruit name="laranja" fallback="orange" size={60} className={`${styles.bannerFruit} ${styles.bf2}`} />
          <Fruit name="banana" fallback="banana" size={64} className={`${styles.bannerFruit} ${styles.bf3}`} />

          <div className={styles.bannerContent}>
            <button type="button" className={styles.bigAvatar} onClick={() => photoRef.current && photoRef.current.click()} title="Alterar foto">
              {photo ? <img src={photo} alt={name} /> : <span>{initials(name)}</span>}
              <span className={styles.avatarOverlay}>
                <Icon name="camera" size={22} />
              </span>
            </button>
            <div className={styles.bannerInfo}>
              <span className={styles.kicker}>Paciente</span>
              <h1 className={styles.name}>{name}</h1>
              <div className={styles.meta}>
                {age != null ? <span className={styles.metaItem}>{age} anos</span> : null}
                <span className={styles.metaItem}>{sexo}</span>
                <span className={styles.metaItem}>
                  <Icon name="mail" size={16} /> {email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Abas + Anamnese */}
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button type="button" className={`${styles.tab} ${tab === "geral" ? styles.tabActive : ""}`} onClick={() => setTab("geral")}>
              <Icon name="grid" size={18} /> Visão geral
            </button>
            <button type="button" className={`${styles.tab} ${tab === "dados" ? styles.tabActive : ""}`} onClick={() => setTab("dados")}>
              <Icon name="clipboard" size={18} /> Dados
            </button>
            <button type="button" className={`${styles.tab} ${tab === "plano" ? styles.tabActive : ""}`} onClick={() => setTab("plano")}>
              <Icon name={plan ? "utensils" : "lock"} size={18} /> Plano alimentar
            </button>
          </div>
          <div className={styles.toolbarActions}>
            <button type="button" className={styles.anamneseBtn} onClick={openAnamnese}>
              <Icon name="clipboard" size={18} />
              {anamneseStatus === "completed" ? "Ver anamnese" : "Anamnese"}
              {anamneseStatus === "draft" && <span className={`${styles.anamneseBadge} ${styles.badgeRascunho}`}>rascunho</span>}
              {anamneseStatus === "completed" && <span className={`${styles.anamneseBadge} ${styles.badgeFinal}`}>finalizada</span>}
            </button>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => {
                setDeleteError(null);
                setConfirmDelete(true);
              }}
            >
              <Icon name="trash" size={18} />
              Excluir paciente
            </button>
          </div>
        </div>

        {/* Visão geral */}
        {tab === "geral" && (
          <div className={styles.grid}>
            <div className={styles.colMain}>
              <Card elevation="sm" padding="lg">
                <span className={styles.sectionTitle}>
                  <Icon name="user" size={18} /> Dados do paciente
                </span>
                <div className={styles.dataGrid}>
                  <DataItem label="Sexo" value={sexo} />
                  <DataItem label="Nascimento" value={fmtDate(profile.birthDate)} />
                  <DataItem label="E-mail" value={email} />
                  <DataItem label="Altura" value={profile.heightCm ? `${profile.heightCm} cm` : "—"} />
                  <DataItem label="Peso" value={profile.weightKg ? `${profile.weightKg} kg` : "—"} />
                  <DataItem label="Restrições" value={restr.length ? `${restr.length}` : "Nenhuma"} />
                </div>
                <button type="button" className={styles.seeMore} onClick={() => setTab("dados")}>
                  Ver ficha completa <Icon name="arrowRight" size={16} />
                </button>
              </Card>

              <Card elevation="sm" padding="lg">
                <span className={styles.sectionTitle}>
                  <Icon name="edit" size={18} /> Observações
                </span>
                <textarea
                  className={styles.obsArea}
                  value={obs}
                  placeholder="Anotações clínicas sobre o paciente, evolução, combinados…"
                  onChange={(e) => setObs(e.target.value)}
                />
                <div className={styles.obsActions}>
                  <Button onClick={saveObs} loading={savingObs} iconLeft={<Icon name="check" size={18} />}>
                    {obsSaved ? "Salvo!" : "Salvar observações"}
                  </Button>
                </div>
              </Card>

              <Card elevation="sm" padding="lg">
                <span className={styles.sectionTitle}>
                  <Icon name="upload" size={18} /> Plano alimentar
                </span>
                {up && up.status === "uploading" ? (
                  <UploadProgress up={up} />
                ) : plan ? (
                  <div className={styles.planoCard}>
                    <span className={styles.planoIcon}>
                      <Icon name="utensils" size={22} />
                    </span>
                    <span className={styles.planoInfo}>
                      <span className={styles.planoName}>Plano ativo · {plan.totals.kcal} kcal</span>
                      <span className={styles.planoMeta}>{plan.meals.length} refeições · {plan.recipes.length} receitas</span>
                    </span>
                    <div className={styles.planoActions}>
                      <Button variant="ghost" onClick={() => setTab("plano")} iconRight={<Icon name="arrowRight" size={18} />}>
                        Ver
                      </Button>
                      <Button onClick={() => fileRef.current && fileRef.current.click()} iconLeft={<Icon name="upload" size={18} />}>
                        Atualizar plano alimentar
                      </Button>
                    </div>
                  </div>
                ) : plan === undefined ? (
                  <Skeleton width="100%" height={64} radius="var(--radius-md)" />
                ) : (
                  <button
                    type="button"
                    className={`${styles.drop} ${dragOver ? styles.dropActive : ""}`}
                    onClick={() => fileRef.current && fileRef.current.click()}
                    onDragOver={onDragOver}
                    onDragEnter={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                  >
                    <span className={styles.dropIcon}>
                      <Icon name={dragOver ? "check" : "upload"} size={26} />
                    </span>
                    <span className={styles.dropTitle}>{dragOver ? "Solte o PDF aqui" : "Enviar plano alimentar"}</span>
                    <span className={`${styles.dropHint} ${up && up.status === "error" ? styles.dropHintError : ""}`}>
                      {up && up.status === "error" ? up.error : "Arraste o PDF do plano aqui ou clique para enviar."}
                    </span>
                  </button>
                )}
              </Card>
            </div>

            <Card elevation="sm" padding="lg" className={styles.cardChat}>
              <span className={styles.sectionTitle}>
                <Icon name="chat" size={18} /> Conversa
              </span>
              {msgs === null ? (
                <div className={styles.loadingStack}>
                  <Skeleton width="60%" height={36} radius="var(--radius-lg)" />
                  <Skeleton width="50%" height={36} radius="var(--radius-lg)" />
                </div>
              ) : (
                <Chat key={id} patient={{ id, name, online: false, pinned: false, messages: msgs }} onSend={handleSend} onTogglePin={() => {}} />
              )}
            </Card>
          </div>
        )}

        {/* Dados */}
        {tab === "dados" && (
          <div className={styles.dadosWrap}>
            <Card elevation="sm" padding="lg">
              <h3 className={styles.dadosSecTitle}>
                <Icon name="user" size={16} /> Identificação
              </h3>
              <div className={styles.fieldGrid}>
                <div className={styles.field}><span className={styles.fieldLabel}>Nome</span><span className={styles.fieldValue}>{name}</span></div>
                <div className={styles.field}><span className={styles.fieldLabel}>Sexo</span><span className={styles.fieldValue}>{sexo}</span></div>
                <div className={styles.field}><span className={styles.fieldLabel}>Nascimento</span><span className={styles.fieldValue}>{fmtDate(profile.birthDate)}</span></div>
                <div className={styles.field}><span className={styles.fieldLabel}>Idade</span><span className={styles.fieldValue}>{age != null ? `${age} anos` : "—"}</span></div>
                <div className={styles.field}><span className={styles.fieldLabel}>E-mail</span><span className={styles.fieldValue}>{email}</span></div>
                <div className={styles.field}><span className={styles.fieldLabel}>Altura</span><span className={styles.fieldValue}>{profile.heightCm ? `${profile.heightCm} cm` : "—"}</span></div>
                <div className={styles.field}><span className={styles.fieldLabel}>Peso</span><span className={styles.fieldValue}>{profile.weightKg ? `${profile.weightKg} kg` : "—"}</span></div>
              </div>
            </Card>

            {restr.length > 0 && (
              <Card elevation="sm" padding="lg">
                <h3 className={styles.dadosSecTitle}>
                  <Icon name="leaf" size={16} /> Restrições
                </h3>
                <div className={styles.fieldGrid}>
                  {restr.map((r) => (
                    <div key={r.id} className={styles.field}>
                      <span className={styles.fieldLabel}>{r.type}</span>
                      <span className={styles.fieldValue}>{r.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card elevation="sm" padding="lg">
              <h3 className={styles.dadosSecTitle}>
                <Icon name="clipboard" size={16} /> Anamnese
              </h3>
              {anamnesis === undefined ? (
                <Skeleton width="100%" height={60} />
              ) : !anamnesis ? (
                <EmptyState
                  compact
                  icon="clipboard"
                  title="Anamnese ainda não preenchida"
                  message="Faça a anamnese para registrar a ficha clínica do paciente."
                  action={
                    <Button onClick={() => router.push(`/anamnese?patient=${id}`)} iconLeft={<Icon name="clipboard" size={18} />}>
                      Fazer anamnese
                    </Button>
                  }
                />
              ) : snapshot.length ? (
                <>
                  <div className={styles.fieldGrid}>
                    {snapshot.map((f, i) => (
                      <div key={i} className={styles.field}>
                        <span className={styles.fieldLabel}>{f.label}</span>
                        <span className={styles.fieldValue}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                  {anamnesis.status === "completed" && (
                    <div className={styles.anamneseViewAction}>
                      <Button onClick={() => router.push(`/anamnese?patient=${id}&view=1`)} iconLeft={<Icon name="clipboard" size={18} />}>
                        Ver anamnese completa
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className={styles.dropHint}>Anamnese {anamnesis.status === "completed" ? "finalizada" : "em rascunho"}.</p>
              )}
            </Card>
          </div>
        )}

        {/* Plano alimentar */}
        {tab === "plano" &&
          (plan ? (
            <PlanoView plan={plan} patientId={id} />
          ) : up && up.status === "uploading" ? (
            <Card elevation="sm" padding="lg">
              <UploadProgress up={up} />
            </Card>
          ) : (
            <Card elevation="sm" padding="lg">
              <div
                className={`${styles.locked} ${dragOver ? styles.lockedActive : ""}`}
                onDragOver={onDragOver}
                onDragEnter={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <span className={styles.lockedIcon}>
                  <Icon name={dragOver ? "check" : "lock"} size={32} />
                </span>
                <h2 className={styles.lockedTitle}>{dragOver ? "Solte o PDF aqui" : "Plano alimentar não enviado"}</h2>
                <p className={styles.lockedSub}>
                  {up && up.status === "error"
                    ? up.error
                    : "Envie o PDF do plano — o sistema extrai refeições, substituições, macros e receitas automaticamente. Arraste aqui ou clique no botão."}
                </p>
                <Button onClick={() => fileRef.current && fileRef.current.click()} iconLeft={<Icon name="upload" size={18} />}>
                  Enviar plano alimentar
                </Button>
              </div>
            </Card>
          ))}

        <Modal
          open={confirmDelete}
          onClose={deleting ? undefined : () => setConfirmDelete(false)}
          closeOnBackdrop={!deleting}
          closeOnEsc={!deleting}
          title="Excluir paciente"
          description={`Tem certeza que deseja excluir ${name}?`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={deletePatient} loading={deleting} iconLeft={<Icon name="trash" size={18} />}>
                Excluir paciente
              </Button>
            </>
          }
        >
          <p className={styles.deleteWarn}>
            Essa ação é <strong>permanente</strong>: a conta do paciente e todos os dados vinculados (anamnese, plano
            alimentar, conversas e histórico) serão removidos e não poderão ser recuperados.
          </p>
          {deleteError && (
            <p className={styles.deleteError}>
              <Icon name="help" size={16} /> {deleteError}
            </p>
          )}
        </Modal>

        <input ref={fileRef} type="file" accept="application/pdf,.pdf" hidden onChange={onPlanoFile} />
        <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhoto} />

        {editorSrc && <PhotoEditor src={editorSrc} onSave={savePhoto} onCancel={() => setEditorSrc(null)} />}
      </div>
    </AppShell>
  );
}
