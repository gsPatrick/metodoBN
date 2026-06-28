"use client";

import { useEffect, useRef, useState } from "react";
import PatientShell from "@/components/organisms/PatientShell/PatientShell";
import Chat from "@/components/organisms/Chat/Chat";
import Skeleton from "@/components/atoms/Skeleton/Skeleton";
import { apiGet, apiPost, apiPatch, getCurrentUser, getProfileId } from "@/lib/api";
import { onNewMessage } from "@/lib/socket";

const pad = (n) => String(n).padStart(2, "0");
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

export default function ChatPacientePage() {
  const [me] = useState(() => (typeof window !== "undefined" ? getCurrentUser() : null));
  const [conv, setConv] = useState(null);
  const [msgs, setMsgs] = useState(null);
  const [nutriName, setNutriName] = useState("Sua nutricionista");
  const convRef = useRef(null);
  useEffect(() => {
    convRef.current = conv;
  }, [conv]);

  // realtime: novas mensagens da nutri
  useEffect(() => {
    const unsub = onNewMessage((data) => {
      const c = convRef.current;
      if (!c || !data || data.conversationId !== c.id) return;
      setMsgs((list) => {
        const arr = list || [];
        if (arr.some((m) => m.id === data.message.id)) return arr;
        return [...arr, mapMsg(data.message, me && me.id)];
      });
      apiPatch(`/conversations/${c.id}/read`).catch(() => {});
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const pid = await getProfileId();
      if (!pid) {
        if (active) setMsgs([]);
        return;
      }
      try {
        const c = await apiPost("/conversations", { patientProfileId: pid });
        if (!active) return;
        setConv(c);
        try {
          const list = await apiGet("/conversations");
          const found = (Array.isArray(list) ? list : []).find((x) => x.id === c.id);
          if (active && found && found.nutritionist && found.nutritionist.name) setNutriName(found.nutritionist.name);
        } catch {
          /* mantém genérico */
        }
        const messages = await apiGet(`/conversations/${c.id}/messages`);
        if (active) setMsgs((Array.isArray(messages) ? messages : []).map((m) => mapMsg(m, me && me.id)));
        apiPatch(`/conversations/${c.id}/read`).catch(() => {});
      } catch {
        if (active) setMsgs([]);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSend(msg) {
    if (!conv || !msg) return;
    const payload =
      msg.type === "text"
        ? { type: "text", body: msg.text }
        : { type: msg.type, attachmentUrl: msg.src, attachmentName: msg.name, attachmentSize: msg.size, durationSec: msg.duration };
    try {
      await apiPost(`/conversations/${conv.id}/messages`, payload);
    } catch {
      /* já apareceu localmente */
    }
  }

  return (
    <PatientShell active="chat" title="Conversa" subtitle={nutriName} fill>
      {msgs === null ? (
        <Skeleton width="55%" height={38} radius="var(--radius-lg)" />
      ) : (
        <Chat
          key={conv ? conv.id : "none"}
          partner
          patient={{ name: nutriName, subtitle: "Nutricionista · online", online: true, messages: msgs }}
          onSend={handleSend}
        />
      )}
    </PatientShell>
  );
}
