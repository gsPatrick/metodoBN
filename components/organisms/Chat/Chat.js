"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Chat.module.css";
import Icon from "@/components/atoms/Icon/Icon";
import Avatar from "@/components/atoms/Avatar/Avatar";

let counter = 0;
const newId = () => `m${++counter}`;

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function humanSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fmt(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// lê um File/Blob como dataURL (base64) para persistir o anexo na API
function toDataUrl(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(fileOrBlob);
  });
}
// reduz a imagem antes de enviar (evita anexos enormes)
function compressImage(dataUrl, maxDim = 1280, quality = 0.72) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const r = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}
const MAX_ATTACH = 14 * 1024 * 1024; // ~14MB (limite do servidor é 15MB)

/* ---------- player de áudio ---------- */
function AudioBubble({ src, duration, name }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(duration || 0);

  function toggle() {
    const a = ref.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      a.play();
    }
  }

  const pct = dur ? Math.min(100, (cur / dur) * 100) : 0;

  function seek(e) {
    const a = ref.current;
    if (!a || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    a.currentTime = ratio * dur;
  }

  return (
    <div className={styles.audio}>
      <button type="button" className={styles.audioBtn} onClick={toggle} aria-label={playing ? "Pausar" : "Tocar"}>
        <Icon name={playing ? "pause" : "play"} size={18} />
      </button>
      <div className={styles.audioTrack} onClick={seek}>
        <span className={styles.audioFill} style={{ "--p": `${pct}%` }} />
      </div>
      <span className={styles.audioTime}>{fmt(playing || cur ? cur : dur)}</span>
      <a className={styles.audioDl} href={src} download={name || "audio.webm"} aria-label="Baixar áudio">
        <Icon name="download" size={16} />
      </a>
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCur(0);
        }}
        onLoadedMetadata={(e) => {
          if (isFinite(e.currentTarget.duration)) setDur(e.currentTarget.duration);
        }}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
      />
    </div>
  );
}

/* ---------- visualizador de imagem (lightbox) ---------- */
function Lightbox({ item, onClose }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.lightbox} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.lbBar} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.lbBtn} onClick={() => setScale((s) => Math.max(1, +(s - 0.25).toFixed(2)))} aria-label="Diminuir zoom">
          <Icon name="zoomOut" size={20} />
        </button>
        <button type="button" className={styles.lbBtn} onClick={() => setScale((s) => Math.min(4, +(s + 0.25).toFixed(2)))} aria-label="Aumentar zoom">
          <Icon name="zoomIn" size={20} />
        </button>
        <a className={styles.lbBtn} href={item.src} download={item.name || "imagem"} aria-label="Baixar">
          <Icon name="download" size={20} />
        </a>
        <button type="button" className={styles.lbBtn} onClick={onClose} aria-label="Fechar">
          <Icon name="close" size={20} />
        </button>
      </div>
      <img
        className={styles.lbImg}
        src={item.src}
        alt={item.name || ""}
        style={{ "--s": scale }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/* ---------- chat principal ---------- */
export default function Chat({ patient, onTogglePin, partner = false, onSend }) {
  const [messages, setMessages] = useState(() =>
    (patient.messages || []).map((m, i) => ({ type: "text", time: "", ...m, id: m.id || `s${i}` }))
  );

  // sincroniza mensagens que chegam por props (carregamento / realtime), sem duplicar
  useEffect(() => {
    const incoming = patient.messages || [];
    setMessages((local) => {
      const have = new Set(local.map((m) => m.id));
      const add = incoming.filter((m) => m.id && !have.has(m.id)).map((m) => ({ type: "text", time: "", ...m }));
      return add.length ? [...local, ...add] : local;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.messages]);
  const [draft, setDraft] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [lightbox, setLightbox] = useState(null);

  const scrollRef = useRef(null);
  const docInput = useRef(null);
  const imgInput = useRef(null);
  const camInput = useRef(null);
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const secRef = useRef(0);
  const cancelRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function append(msg) {
    setMessages((list) => [...list, { id: newId(), from: "me", time: nowTime(), ...msg }]);
  }

  function sendText() {
    const t = draft.trim();
    if (!t) return;
    append({ type: "text", text: t });
    setDraft("");
    if (onSend) onSend({ type: "text", text: t });
  }

  async function onFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    setAttachOpen(false);
    for (const f of files) {
      const isImg = f.type.startsWith("image/");
      try {
        let dataUrl = await toDataUrl(f);
        if (isImg) dataUrl = await compressImage(dataUrl);
        if (dataUrl.length > MAX_ATTACH * 1.37) {
          alert("Arquivo muito grande (máx. ~10MB). Tente um menor.");
          continue;
        }
        const msg = isImg
          ? { type: "image", src: dataUrl, name: f.name }
          : { type: "doc", src: dataUrl, name: f.name, size: humanSize(f.size) };
        append(msg);
        if (onSend) onSend(msg);
      } catch {
        /* ignora arquivo com erro de leitura */
      }
    }
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Gravação de áudio não suportada neste navegador.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      cancelRef.current = false;
      rec.ondataavailable = (ev) => ev.data.size && chunksRef.current.push(ev.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current);
        const seconds = secRef.current;
        setRecording(false);
        setRecSec(0);
        secRef.current = 0;
        if (cancelRef.current) return;
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        try {
          const dataUrl = await toDataUrl(blob);
          const msg = { type: "audio", src: dataUrl, duration: seconds, name: "audio.webm" };
          append(msg);
          if (onSend) onSend(msg);
        } catch {
          /* ignora */
        }
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      secRef.current = 0;
      setRecSec(0);
      timerRef.current = setInterval(() => {
        secRef.current += 1;
        setRecSec(secRef.current);
      }, 1000);
    } catch {
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  }

  function stopRecording(cancel) {
    cancelRef.current = !!cancel;
    recRef.current?.stop();
  }

  return (
    <div className={styles.chat}>
      {/* cabeçalho */}
      <div className={styles.head}>
        <Avatar name={patient.name} size="sm" status={patient.online ? "online" : "offline"} />
        <span className={styles.headText}>
          <span className={styles.headName}>{patient.name}</span>
          {partner ? (
            <span className={styles.headSub}>{patient.subtitle || (patient.online ? "online" : "offline")}</span>
          ) : (
            <a href={`/pacientes/${patient.id}`} className={styles.headLink}>
              Ver ficha completa →
            </a>
          )}
        </span>
        {!partner && (
          <button
            type="button"
            className={`${styles.pinBtn} ${patient.pinned ? styles.pinActive : ""}`}
            onClick={onTogglePin}
            aria-pressed={patient.pinned}
            aria-label={patient.pinned ? "Desafixar conversa" : "Fixar conversa"}
            title={patient.pinned ? "Desafixar" : "Fixar conversa"}
          >
            <Icon name="star" size={18} />
          </button>
        )}
      </div>

      {/* mensagens */}
      <div className={styles.msgs} ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`${styles.msg} ${m.from === "me" ? styles.me : styles.them}`}>
            {m.type === "text" && <span className={styles.text}>{m.text}</span>}

            {m.type === "image" && (
              <span className={styles.imgWrap}>
                <img
                  className={styles.img}
                  src={m.src}
                  alt={m.name || ""}
                  onClick={() => setLightbox(m)}
                  title="Abrir imagem"
                />
                <span className={styles.mediaFoot}>
                  {m.name && <span className={styles.mediaName}>{m.name}</span>}
                  <a
                    className={styles.mediaDl}
                    href={m.src}
                    download={m.name || "imagem"}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Baixar imagem"
                  >
                    <Icon name="download" size={16} />
                  </a>
                </span>
              </span>
            )}

            {m.type === "audio" && <AudioBubble src={m.src} duration={m.duration} name={m.name} />}

            {m.type === "doc" && (
              <div className={styles.doc}>
                <span className={styles.docIcon}>
                  <Icon name="fileDoc" size={22} />
                </span>
                <span className={styles.docInfo}>
                  <span className={styles.docName}>{m.name}</span>
                  {m.size && <span className={styles.docSize}>{m.size}</span>}
                </span>
                <a className={styles.docDl} href={m.src} download={m.name} aria-label="Baixar documento">
                  <Icon name="download" size={18} />
                </a>
              </div>
            )}

            {m.time && <span className={styles.time}>{m.time}</span>}
          </div>
        ))}
      </div>

      {/* composer */}
      <div className={styles.composer}>
        {recording ? (
          <div className={styles.recBar}>
            <button type="button" className={styles.recCancel} onClick={() => stopRecording(true)} aria-label="Cancelar gravação">
              <Icon name="trash" size={20} />
            </button>
            <span className={styles.recDot} aria-hidden="true" />
            <span className={styles.recTime}>{fmt(recSec)}</span>
            <span className={styles.recLabel}>Gravando áudio…</span>
            <button type="button" className={styles.sendBtn} onClick={() => stopRecording(false)} aria-label="Enviar áudio">
              <Icon name="arrowRight" size={20} strokeWidth={2.2} />
            </button>
          </div>
        ) : (
          <>
            <div className={styles.attachZone}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setAttachOpen((v) => !v)}
                aria-label="Anexar"
                aria-expanded={attachOpen}
              >
                <Icon name="paperclip" size={22} />
              </button>
              {attachOpen && (
                <>
                  <div className={styles.attachBackdrop} onClick={() => setAttachOpen(false)} />
                  <div className={styles.attachMenu}>
                    <button type="button" className={styles.attachItem} onClick={() => docInput.current?.click()}>
                      <span className={`${styles.attachIco} ${styles.icoDoc}`}><Icon name="fileDoc" size={20} /></span>
                      Documento
                    </button>
                    <button type="button" className={styles.attachItem} onClick={() => imgInput.current?.click()}>
                      <span className={`${styles.attachIco} ${styles.icoImg}`}><Icon name="image" size={20} /></span>
                      Fotos e vídeos
                    </button>
                    <button type="button" className={styles.attachItem} onClick={() => camInput.current?.click()}>
                      <span className={`${styles.attachIco} ${styles.icoCam}`}><Icon name="camera" size={20} /></span>
                      Câmera
                    </button>
                  </div>
                </>
              )}
            </div>

            <input
              className={styles.input}
              type="text"
              value={draft}
              placeholder={`Mensagem para ${patient.name.split(" ")[0]}…`}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText()}
            />

            {draft.trim() ? (
              <button type="button" className={styles.sendBtn} onClick={sendText} aria-label="Enviar">
                <Icon name="arrowRight" size={20} strokeWidth={2.2} />
              </button>
            ) : (
              <button type="button" className={styles.micBtn} onClick={startRecording} aria-label="Gravar áudio">
                <Icon name="mic" size={20} />
              </button>
            )}
          </>
        )}

        {/* inputs ocultos */}
        <input ref={docInput} type="file" hidden onChange={onFiles} />
        <input ref={imgInput} type="file" accept="image/*,video/*" hidden multiple onChange={onFiles} />
        <input ref={camInput} type="file" accept="image/*" capture="environment" hidden onChange={onFiles} />
      </div>

      {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
