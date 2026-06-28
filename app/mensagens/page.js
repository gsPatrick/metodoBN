"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

import AppShell from "@/components/organisms/AppShell/AppShell";
import Icon from "@/components/atoms/Icon/Icon";
import Avatar from "@/components/atoms/Avatar/Avatar";
import Chat from "@/components/organisms/Chat/Chat";
import Skeleton from "@/components/atoms/Skeleton/Skeleton";
import EmptyState from "@/components/molecules/EmptyState/EmptyState";
import { apiGet, apiPost, apiPatch, getCurrentUser } from "@/lib/api";
import { onNewMessage } from "@/lib/socket";

const pad = (n) => String(n).padStart(2, "0");
function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}
function convName(c) {
  return (c.patientProfile && c.patientProfile.user && c.patientProfile.user.name) || "Paciente";
}
function previewOf(m) {
  if (m.type === "image") return "📷 Imagem";
  if (m.type === "doc") return "📄 Documento";
  if (m.type === "audio") return "🎤 Áudio";
  return (m.body || "").slice(0, 160);
}
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

export default function MensagensPage() {
  const [me, setMe] = useState(null);
  const [q, setQ] = useState("");
  const [conversations, setConversations] = useState(null); // null = carregando
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [msgs, setMsgs] = useState(null);
  const selectedIdRef = useRef(null);
  const meRef = useRef(null);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);
  useEffect(() => {
    meRef.current = me;
  }, [me]);

  // realtime: mensagem nova de qualquer paciente
  useEffect(() => {
    const unsub = onNewMessage((data) => {
      if (!data || !data.message) return;
      const cid = data.conversationId;
      const isOpen = cid === selectedIdRef.current;
      if (isOpen) {
        setMsgs((list) => {
          const arr = list || [];
          if (arr.some((m) => m.id === data.message.id)) return arr;
          return [...arr, mapMsg(data.message, meRef.current && meRef.current.id)];
        });
        apiPatch(`/conversations/${cid}/read`)
          .then(() => window.dispatchEvent(new Event("bn-unread-refresh")))
          .catch(() => {});
      }
      setConversations((list) => {
        if (!list) return list;
        let found = false;
        const next = list.map((c) => {
          if (c.id !== cid) return c;
          found = true;
          return {
            ...c,
            lastMessageAt: data.message.createdAt,
            lastMessagePreview: previewOf(data.message),
            nutriUnread: isOpen ? 0 : (c.nutriUnread || 0) + 1,
          };
        });
        if (!found) return list;
        next.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
        return next;
      });
    });
    return unsub;
  }, []);

  async function load() {
    setError(null);
    setConversations(null);
    try {
      const data = await apiGet("/conversations");
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e && e.message ? e.message : "Erro ao carregar.");
      setConversations([]);
    }
  }
  useEffect(() => {
    setMe(getCurrentUser());
    load();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    setMsgs(null);
    apiGet(`/conversations/${selectedId}/messages`)
      .then((data) => active && setMsgs((Array.isArray(data) ? data : []).map((m) => mapMsg(m, me && me.id))))
      .catch(() => active && setMsgs([]));
    // marca como lida
    apiPatch(`/conversations/${selectedId}/read`)
      .then(() => window.dispatchEvent(new Event("bn-unread-refresh")))
      .catch(() => {});
    setConversations((list) => (list || []).map((c) => (c.id === selectedId ? { ...c, nutriUnread: 0 } : c)));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const list = useMemo(() => {
    if (!conversations) return [];
    const t = q.trim().toLowerCase();
    return conversations.filter((c) => !t || convName(c).toLowerCase().includes(t));
  }, [conversations, q]);

  const selected = (conversations || []).find((c) => c.id === selectedId) || null;
  const totalUnread = (conversations || []).reduce((n, c) => n + (c.nutriUnread || 0), 0);
  const loading = conversations === null;

  async function handleSend(msg) {
    if (!selectedId || !msg) return;
    const payload =
      msg.type === "text"
        ? { type: "text", body: msg.text }
        : { type: msg.type, attachmentUrl: msg.src, attachmentName: msg.name, attachmentSize: msg.size, durationSec: msg.duration };
    try {
      await apiPost(`/conversations/${selectedId}/messages`, payload);
      // atualiza a prévia/ordem da lista no envio
      setConversations((list) =>
        (list || [])
          .map((c) => (c.id === selectedId ? { ...c, lastMessageAt: new Date().toISOString(), lastMessagePreview: previewOf(payload) } : c))
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
      );
    } catch {
      /* já apareceu localmente */
    }
  }

  return (
    <AppShell active="mensagens" title="Mensagens" flush>
      <div className={styles.wrap} data-open={selected ? "chat" : "list"}>
        <aside className={styles.listPane}>
          <div className={styles.listHead}>
            <div className={styles.listTitleRow}>
              <h2 className={styles.listTitle}>Conversas</h2>
              {totalUnread > 0 && <span className={styles.totalUnread}>{totalUnread}</span>}
            </div>
            <span className={styles.search}>
              <Icon name="search" size={18} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar conversa…" disabled={loading} />
            </span>
          </div>

          <div className={styles.convs}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.conv}>
                  <Skeleton circle width={46} height={46} />
                  <span className={styles.convBody}>
                    <Skeleton width="55%" height={14} />
                    <Skeleton width="80%" height={12} />
                  </span>
                </div>
              ))
            ) : error ? (
              <EmptyState compact variant="error" icon="help" title="Não foi possível carregar" message={error} action={<button type="button" className={styles.retry} onClick={load}>Tentar de novo</button>} />
            ) : list.length === 0 ? (
              <EmptyState compact icon="chat" title={q ? "Nada encontrado" : "Nenhuma conversa ainda"} message={q ? `Sem resultados para “${q}”.` : "As conversas com seus pacientes aparecem aqui."} />
            ) : (
              list.map((c) => {
                const nm = convName(c);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.conv} ${c.id === selectedId ? styles.convActive : ""}`}
                    onClick={() => {
                      if (c.id !== selectedId) {
                        setMsgs(null); // evita mostrar mensagens da conversa anterior
                        setSelectedId(c.id);
                      }
                    }}
                  >
                    <Avatar name={nm} size="md" />
                    <span className={styles.convBody}>
                      <span className={styles.convTop}>
                        <span className={styles.convName}>{nm}</span>
                        <span className={styles.convTime}>{fmtTime(c.lastMessageAt)}</span>
                      </span>
                      <span className={styles.convBottom}>
                        <span className={styles.convPreview}>{c.lastMessagePreview || "Iniciar conversa"}</span>
                        {c.nutriUnread > 0 && <span className={styles.unread}>{c.nutriUnread}</span>}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className={styles.chatPane}>
          {selected ? (
            <>
              <button type="button" className={styles.backBtn} onClick={() => setSelectedId(null)}>
                <Icon name="chevronLeft" size={18} /> Conversas
              </button>
              <Chat
                key={selected.id}
                patient={{ id: selected.patientProfileId, name: convName(selected), online: false, pinned: false, messages: msgs || [] }}
                onSend={handleSend}
                onTogglePin={() => {}}
              />
            </>
          ) : (
            <div className={styles.emptyChat}>
              <span className={styles.emptyIcon}>
                <Icon name="chat" size={36} />
              </span>
              <p className={styles.emptyText}>Selecione uma conversa para começar</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
