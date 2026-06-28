"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

import AppShell from "@/components/organisms/AppShell/AppShell";
import Card from "@/components/atoms/Card/Card";
import Icon from "@/components/atoms/Icon/Icon";
import Input from "@/components/atoms/Input/Input";
import Button from "@/components/atoms/Button/Button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { apiGet, apiPatch, apiPost, getCurrentUser, setSession, clearSession } from "@/lib/api";

const THEMES = [
  { key: "light", label: "Claro", icon: "sun" },
  { key: "dark", label: "Escuro", icon: "moon" }
];

const maskPhone = (v) => {
  const d = (v || "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};
function initials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
function Row({ title, desc, children }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <span className={styles.rowTitle}>{title}</span>
        {desc && <span className={styles.rowDesc}>{desc}</span>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  );
}

export default function AjustesPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const u = getCurrentUser();
    if (u) {
      setUserId(u.id);
      setName(u.name || "");
      setEmail(u.email || "");
      setPhone(u.phone || "");
    }
    // refresca com o servidor
    apiGet("/auth/me")
      .then((me) => {
        if (!me) return;
        setUserId(me.id);
        setName(me.name || "");
        setEmail(me.email || "");
        setPhone(me.phone || "");
      })
      .catch(() => {});
  }, []);

  function flash(msg) {
    setNote(msg);
    setTimeout(() => setNote(""), 2600);
  }

  async function saveProfile() {
    if (!userId) return;
    setSaving(true);
    try {
      const updated = await apiPatch(`/users/${userId}`, { name, phone });
      setSession(null, updated); // atualiza o usuário em cache (sidebar/saudação)
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      flash(e && e.message ? e.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    try {
      await apiPost("/auth/forgot-password", { email }, { auth: false });
    } catch {
      /* resposta neutra */
    }
    flash("Enviamos um link de redefinição para o seu e-mail.");
  }

  async function logoutOthers() {
    try {
      await apiPost("/auth/logout-all", {});
      flash("Outras sessões foram encerradas.");
    } catch (e) {
      flash(e && e.message ? e.message : "Não foi possível encerrar.");
    }
  }

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <AppShell active="ajustes" title="Ajustes">
      <div className={styles.page}>
        {note && (
          <div className={styles.note}>
            <Icon name="check" size={16} /> {note}
          </div>
        )}

        {/* ===== Perfil ===== */}
        <Card elevation="sm" padding="lg">
          <div className={styles.head}>
            <span className={styles.title}>Perfil</span>
            <span className={styles.sub}>Seus dados de acesso e contato.</span>
          </div>

          <div className={styles.profileTop}>
            <span className={styles.avatar}>
              <span>{initials(name)}</span>
            </span>
            <div className={styles.profileName}>
              <span className={styles.profileNameText}>{name || "—"}</span>
              <span className={styles.profileRole}>Nutricionista</span>
            </div>
          </div>

          <div className={styles.form}>
            <label className={styles.field}>
              <span className={styles.label}>Nome completo</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} iconLeft={<Icon name="user" size={18} />} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>E-mail</span>
              <Input type="email" value={email} disabled iconLeft={<Icon name="mail" size={18} />} />
            </label>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.label}>Telefone</span>
              <Input value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} iconLeft={<Icon name="chat" size={18} />} />
            </label>
          </div>

          <div className={styles.formActions}>
            <Button onClick={saveProfile} loading={saving} iconLeft={<Icon name="check" size={18} />}>
              {saved ? "Salvo!" : "Salvar perfil"}
            </Button>
          </div>
        </Card>

        {/* ===== Aparência ===== */}
        <Card elevation="sm" padding="lg">
          <div className={styles.head}>
            <span className={styles.title}>Aparência</span>
            <span className={styles.sub}>Escolha como o sistema aparece pra você.</span>
          </div>

          <span className={styles.label}>Tema</span>
          <div className={styles.segment} role="group" aria-label="Tema">
            {THEMES.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`${styles.segItem} ${theme === t.key ? styles.segActive : ""}`}
                onClick={() => setTheme(t.key)}
                aria-pressed={theme === t.key}
              >
                <Icon name={t.icon} size={18} />
                {t.label}
              </button>
            ))}
          </div>
        </Card>

        {/* ===== Segurança ===== */}
        <Card elevation="sm" padding="lg">
          <div className={styles.head}>
            <span className={styles.title}>Segurança</span>
            <span className={styles.sub}>Proteja a sua conta.</span>
          </div>
          <div className={styles.rows}>
            <Row title="Senha" desc="Enviamos um link de redefinição para o seu e-mail.">
              <Button variant="outline" onClick={changePassword}>
                Alterar senha
              </Button>
            </Row>
            <Row title="Sessões ativas" desc="Sair de todos os outros dispositivos.">
              <Button variant="ghost" onClick={logoutOthers}>
                Encerrar outras
              </Button>
            </Row>
          </div>
        </Card>

        {/* ===== Conta ===== */}
        <Card elevation="sm" padding="lg">
          <div className={styles.head}>
            <span className={styles.title}>Conta</span>
            <span className={styles.sub}>Método BN</span>
          </div>
          <div className={styles.accountActions}>
            <Button variant="outline" onClick={logout} iconLeft={<Icon name="logout" size={18} />}>
              Sair da conta
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
