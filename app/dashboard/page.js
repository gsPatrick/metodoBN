"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

import AppShell from "@/components/organisms/AppShell/AppShell";
import Card from "@/components/atoms/Card/Card";
import Icon from "@/components/atoms/Icon/Icon";
import Avatar from "@/components/atoms/Avatar/Avatar";
import Fruit from "@/components/atoms/Fruit/Fruit";
import Skeleton from "@/components/atoms/Skeleton/Skeleton";
import EmptyState from "@/components/molecules/EmptyState/EmptyState";
import Chat from "@/components/organisms/Chat/Chat";
import { apiGet, apiPost, getCurrentUser } from "@/lib/api";

const HERO_IMAGE = "";
const SEX_LABEL = { male: "Masculino", female: "Feminino", other: "Outro" };

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
function patientSub(p) {
  const age = ageFrom(p.birthDate);
  return [SEX_LABEL[p.sex], age != null ? `${age} anos` : null].filter(Boolean).join(" · ") || "Paciente";
}
const pad = (n) => String(n).padStart(2, "0");
function mapMsg(m, myId) {
  const d = new Date(m.createdAt);
  const time = Number.isNaN(d.getTime()) ? "" : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return {
    id: m.id,
    from: m.senderId === myId ? "me" : "them",
    type: m.type || "text",
    text: m.body || "",
    src: m.attachmentUrl || undefined,
    name: m.attachmentName || undefined,
    size: m.attachmentSize || undefined,
    duration: m.durationSec || undefined,
    time,
  };
}

export default function DashboardPage() {
  const [me, setMe] = useState(null);
  useEffect(() => {
    setMe(getCurrentUser());
  }, []);
  const fullName = (me && me.name) || "Nutricionista Beatriz Nascimento";
  const [first, ...restWords] = fullName.trim().split(/\s+/);
  const rest = restWords.join(" ");

  // --- Pacientes ---
  const [patients, setPatients] = useState(null); // null = carregando
  const [patientsErr, setPatientsErr] = useState(null);

  // --- Conversas ---
  const [conversations, setConversations] = useState(null);
  const [convErr, setConvErr] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showList, setShowList] = useState(true);
  const [msgs, setMsgs] = useState(null);

  async function loadPatients() {
    setPatientsErr(null);
    setPatients(null);
    try {
      const data = await apiGet("/users/patients");
      setPatients(Array.isArray(data) ? data : []);
    } catch (e) {
      setPatientsErr(e && e.message ? e.message : "Erro ao carregar.");
      setPatients([]);
    }
  }
  async function loadConversations() {
    setConvErr(null);
    setConversations(null);
    try {
      const data = await apiGet("/conversations");
      const list = Array.isArray(data) ? data : [];
      setConversations(list);
      if (list.length) setSelectedId((cur) => cur || list[0].id);
    } catch (e) {
      setConvErr(e && e.message ? e.message : "Erro ao carregar.");
      setConversations([]);
    }
  }
  useEffect(() => {
    loadPatients();
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // mensagens da conversa selecionada
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    setMsgs(null);
    apiGet(`/conversations/${selectedId}/messages`)
      .then((data) => active && setMsgs((Array.isArray(data) ? data : []).map((m) => mapMsg(m, me && me.id))))
      .catch(() => active && setMsgs([]));
    return () => {
      active = false;
    };
  }, [selectedId, me]);

  const selectedConv = (conversations || []).find((c) => c.id === selectedId) || null;
  const partnerName = selectedConv ? (selectedConv.patientProfile && selectedConv.patientProfile.user && selectedConv.patientProfile.user.name) || "Paciente" : "";

  async function handleSend(msg) {
    if (!selectedId || !msg || msg.type !== "text") return;
    try {
      await apiPost(`/conversations/${selectedId}/messages`, { type: "text", body: msg.text });
    } catch {
      /* silencioso — já apareceu localmente */
    }
  }

  const patientsLoading = patients === null;
  const convLoading = conversations === null;

  return (
    <AppShell active="inicio" title="Início">
      <div className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          {HERO_IMAGE ? <img className={styles.heroImage} src={HERO_IMAGE} alt="" /> : null}
          <div className={styles.heroFruits} aria-hidden="true">
            <Fruit name="morango" fallback="strawberry" size={56} className={`${styles.hf} ${styles.hf1}`} />
            <Fruit name="laranja" fallback="orange" size={62} className={`${styles.hf} ${styles.hf2}`} />
            <Fruit name="maca" fallback="apple" size={60} className={`${styles.hf} ${styles.hf3}`} />
            <Fruit name="banana" fallback="banana" size={66} className={`${styles.hf} ${styles.hf4}`} />
          </div>
          <span className={styles.heroGlow} aria-hidden="true" />

          <div className={styles.heroText}>
            <h1 className={styles.greeting}>
              Olá, <em>{first}<br />{rest}</em>
              <br />👋
            </h1>
            <p className={styles.heroSub}>Cada plano seu transforma uma rotina. Que bom te ver por aqui! 🌱</p>
          </div>
        </section>

        {/* Pacientes + Conversas */}
        <section className={styles.columns}>
          <div className={styles.leftCol}>
            <a href="/pacientes/novo" className={styles.cta}>
              <span className={styles.ctaIcon}>
                <Icon name="clipboard" size={28} strokeWidth={1.9} />
              </span>
              <span className={styles.ctaBody}>
                <span className={styles.ctaTitle}>Cadastrar paciente</span>
                <span className={styles.ctaSub}>O primeiro passo de uma nova consulta</span>
              </span>
              <span className={styles.ctaArrow}>
                <Icon name="arrowRight" size={24} strokeWidth={2.1} />
              </span>
            </a>

            <Card elevation="sm" padding="lg" className={styles.cardPatients}>
              <div className={styles.panelHead}>
                <span className={styles.panelTitle}>
                  <Icon name="users" size={18} /> Seus pacientes
                </span>
                <a href="/pacientes" className={styles.panelLink}>
                  Ver todos
                </a>
              </div>

              {patientsLoading ? (
                <div className={styles.list}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={styles.pRow}>
                      <Skeleton circle width={40} height={40} />
                      <span className={styles.pBody}>
                        <Skeleton width="55%" height={15} />
                        <Skeleton width="35%" height={12} />
                      </span>
                    </div>
                  ))}
                </div>
              ) : patientsErr ? (
                <EmptyState compact variant="error" icon="help" title="Não foi possível carregar" message={patientsErr} action={<button type="button" className={styles.retry} onClick={loadPatients}>Tentar de novo</button>} />
              ) : patients.length === 0 ? (
                <EmptyState compact fruit="salada" title="Nenhum paciente ainda" message="Cadastre o primeiro para começar o acompanhamento." action={<a href="/pacientes/novo" className={styles.retry}>Cadastrar paciente</a>} />
              ) : (
                <div className={styles.list}>
                  {patients.slice(0, 5).map((p) => (
                    <a key={p.id} href={`/pacientes/${p.id}`} className={styles.pRow}>
                      <Avatar name={(p.user && p.user.name) || "Paciente"} size="sm" />
                      <span className={styles.pBody}>
                        <span className={styles.pName}>{(p.user && p.user.name) || "Paciente"}</span>
                        <span className={styles.pSub}>{patientSub(p)}</span>
                      </span>
                      <span className={styles.pTrailing}>
                        <Icon name="chevronRight" size={18} strokeWidth={2} />
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card elevation="sm" padding="lg" className={styles.cardChat}>
            <div className={styles.panelHead}>
              <span className={styles.panelTitle}>
                <Icon name="chat" size={18} /> Conversas
              </span>
              {!convLoading && conversations.length > 0 && (
                <button
                  type="button"
                  className={styles.trayBtn}
                  onClick={() => setShowList((v) => !v)}
                  aria-expanded={showList}
                  aria-label={showList ? "Ocultar conversas" : "Mostrar conversas"}
                >
                  <Icon name="chevronRight" size={18} strokeWidth={2.2} className={styles.trayIcon} />
                </button>
              )}
            </div>

            {convLoading ? (
              <div className={styles.carouselInner}>
                <div className={styles.carousel}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.chip}>
                      <Skeleton circle width={52} height={52} />
                      <Skeleton width={42} height={11} />
                    </div>
                  ))}
                </div>
              </div>
            ) : convErr ? (
              <EmptyState compact variant="error" icon="help" title="Não foi possível carregar" message={convErr} action={<button type="button" className={styles.retry} onClick={loadConversations}>Tentar de novo</button>} />
            ) : conversations.length === 0 ? (
              <EmptyState compact icon="chat" title="Nenhuma conversa ainda" message="Quando você ou um paciente iniciar uma conversa, ela aparece aqui." />
            ) : (
              <>
                <div className={`${styles.carouselWrap} ${showList ? "" : styles.carouselClosed}`}>
                  <div className={styles.carouselInner}>
                    <div className={styles.carousel}>
                      {conversations.map((c) => {
                        const nm = (c.patientProfile && c.patientProfile.user && c.patientProfile.user.name) || "Paciente";
                        return (
                          <button
                            key={c.id}
                            type="button"
                            className={`${styles.chip} ${selectedId === c.id ? styles.chipActive : ""}`}
                            onClick={() => setSelectedId(c.id)}
                            title={nm}
                          >
                            <span className={styles.chipAvatar}>
                              <Avatar name={nm} size="md" />
                              {c.nutriUnread > 0 && <span className={styles.chipUnread}>{c.nutriUnread}</span>}
                            </span>
                            <span className={styles.chipName}>{nm.split(" ")[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {selectedConv && (
                  <Chat
                    key={selectedConv.id}
                    patient={{ id: selectedConv.patientProfileId, name: partnerName, online: false, pinned: false, messages: msgs || [] }}
                    onSend={handleSend}
                    onTogglePin={() => {}}
                  />
                )}
              </>
            )}
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
