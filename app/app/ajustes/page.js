"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ajustes.module.css";

import PatientShell from "@/components/organisms/PatientShell/PatientShell";
import Icon from "@/components/atoms/Icon/Icon";
import Input from "@/components/atoms/Input/Input";
import Button from "@/components/atoms/Button/Button";
import Toggle from "@/components/atoms/Toggle/Toggle";
import PhotoEditor from "@/components/molecules/PhotoEditor/PhotoEditor";
import { ME } from "@/data/me";
import { clearSession } from "@/lib/api";

const THEMES = [
  { key: "light", label: "Claro", icon: "sun" },
  { key: "dark", label: "Escuro", icon: "moon" }
];

const NOTIF = [
  { key: "mensagens", title: "Mensagens da nutri", desc: "Quando a nutri te responder." },
  { key: "lembrete", title: "Lembrete de refeições", desc: "Aviso pra registrar o dia." },
  { key: "plano", title: "Novo plano alimentar", desc: "Quando seu plano for atualizado." }
];

function initials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function AjustesPacientePage() {
  const router = useRouter();
  const [theme, setTheme] = useState("dark");
  const [profile, setProfile] = useState({ nome: ME.name, email: "patrick@email.com" });
  const [notif, setNotif] = useState({ mensagens: true, lembrete: true, plano: true });
  const [photo, setPhoto] = useState(null);
  const [editorSrc, setEditorSrc] = useState(null);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const photoRef = useRef(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem("bn_app_theme");
      if (t === "light" || t === "dark") setTheme(t);
      const p = localStorage.getItem("bn_perfil_me");
      if (p) setProfile((prev) => ({ ...prev, ...JSON.parse(p) }));
      const nf = localStorage.getItem("bn_app_notif");
      if (nf) setNotif((prev) => ({ ...prev, ...JSON.parse(nf) }));
      const ph = localStorage.getItem("bn_foto_me");
      if (ph) setPhoto(ph);
    } catch {
      /* ignora */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("bn_perfil_me", JSON.stringify(profile));
      localStorage.setItem("bn_app_notif", JSON.stringify(notif));
    } catch {
      /* ignora */
    }
  }, [ready, profile, notif]);

  function chooseTheme(next) {
    setTheme(next);
    try {
      localStorage.setItem("bn_app_theme", next);
    } catch {
      /* ignora */
    }
    window.dispatchEvent(new CustomEvent("bn-app-theme", { detail: next }));
  }
  function onPhoto(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setEditorSrc(String(r.result));
    r.readAsDataURL(f);
    e.target.value = "";
  }
  function savePhoto(data) {
    setPhoto(data);
    try {
      localStorage.setItem("bn_foto_me", data);
    } catch {
      /* ignora */
    }
    setEditorSrc(null);
  }

  return (
    <PatientShell active="" title="Perfil e ajustes" subtitle="Sua conta e preferências">
      <div className={styles.card}>
        <div className={styles.profileTop}>
          <button type="button" className={styles.avatar} onClick={() => photoRef.current && photoRef.current.click()} title="Alterar foto">
            {photo ? <img src={photo} alt={profile.nome} /> : <span>{initials(profile.nome)}</span>}
            <span className={styles.avatarCam}>
              <Icon name="camera" size={14} />
            </span>
          </button>
          <div className={styles.profileName}>
            <span className={styles.profileNameText}>{profile.nome}</span>
            <span className={styles.profileRole}>Paciente</span>
          </div>
        </div>
        <label className={styles.field}>
          <span className={styles.label}>Nome</span>
          <Input value={profile.nome} onChange={(e) => setProfile((p) => ({ ...p, nome: e.target.value }))} iconLeft={<Icon name="user" size={18} />} />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>E-mail</span>
          <Input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} iconLeft={<Icon name="mail" size={18} />} />
        </label>
        <div className={styles.actions}>
          <Button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1600); }} iconLeft={<Icon name="check" size={18} />}>
            {saved ? "Salvo!" : "Salvar"}
          </Button>
        </div>
      </div>

      <div className={styles.card}>
        <span className={styles.cardTitle}>Tema</span>
        <div className={styles.segment} role="group" aria-label="Tema">
          {THEMES.map((t) => (
            <button key={t.key} type="button" className={`${styles.segItem} ${theme === t.key ? styles.segActive : ""}`} onClick={() => chooseTheme(t.key)} aria-pressed={theme === t.key}>
              <Icon name={t.icon} size={18} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <span className={styles.cardTitle}>Notificações</span>
        <div className={styles.rows}>
          {NOTIF.map((n) => (
            <div key={n.key} className={styles.row}>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{n.title}</span>
                <span className={styles.rowDesc}>{n.desc}</span>
              </span>
              <Toggle checked={!!notif[n.key]} onChange={(v) => setNotif((p) => ({ ...p, [n.key]: v }))} ariaLabel={n.title} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <span className={styles.cardTitle}>Conta</span>
        <Button
          variant="outline"
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
          iconLeft={<Icon name="logout" size={18} />}
        >
          Sair da conta
        </Button>
      </div>

      <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhoto} />
      {editorSrc && <PhotoEditor src={editorSrc} onSave={savePhoto} onCancel={() => setEditorSrc(null)} />}
    </PatientShell>
  );
}
