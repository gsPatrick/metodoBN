"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

import Logo from "@/components/atoms/Logo/Logo";
import Icon from "@/components/atoms/Icon/Icon";
import Button from "@/components/atoms/Button/Button";
import Input from "@/components/atoms/Input/Input";
import Checkbox from "@/components/atoms/Checkbox/Checkbox";
import FormField from "@/components/molecules/FormField/FormField";
import Alert from "@/components/molecules/Alert/Alert";
import LoginTransition from "@/components/organisms/LoginTransition/LoginTransition";
import { apiPost, setSession } from "@/lib/api";

/* Base da API — troque aqui ou via NEXT_PUBLIC_API_URL. */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/* Foto de fundo do painel esquerdo — salve o arquivo em /public e aponte aqui
   (ex.: "/login.jpg"). Recomendado 2400×3000 (4:5) ou 3840×2160 (4K).
   Vazio = mostra o placeholder com as dimensões. */
const HERO_IMAGE = "/login.jpg";
const HERO_PHRASE = "Pequenas escolhas, grandes transformações.";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [transition, setTransition] = useState(null); // { variant, name, dest }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Informe e-mail ou telefone e a senha.");
      return;
    }
    setLoading(true);
    try {
      // envia identifier (API nova) e email (compatível com a API antiga)
      const data = await apiPost("/auth/login", { identifier: email, email, password }, { auth: false });
      setSession(data.accessToken, data.user);
      // Sempre guarda o refresh token p/ manter a sessão viva (logout só manual).
      if (data.refreshToken) {
        try {
          window.localStorage.setItem("bn_refresh", data.refreshToken);
        } catch {
          /* ignora */
        }
      }
      const isPatient = data.user && data.user.role === "patient";
      setTransition({
        variant: isPatient ? "patient" : "nutri",
        name: data.user && data.user.name,
        dest: isPatient ? "/app" : "/dashboard",
      });
    } catch (err) {
      setError(err && err.message ? err.message : "Credenciais inválidas.");
      setLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Informe seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      setSent(true);
    } catch (err) {
      setSent(true); // resposta neutra: não revela existência do e-mail
    } finally {
      setLoading(false);
    }
  }

  function goForgot() {
    setError("");
    setSent(false);
    setView("forgot");
  }

  function goLogin() {
    setError("");
    setView("login");
  }

  return (
    <div className={styles.page} data-theme="dark">
      {transition && (
        <LoginTransition
          variant={transition.variant}
          name={transition.name}
          onDone={() => router.push(transition.dest)}
        />
      )}
      <aside className={styles.media}>
        {HERO_IMAGE ? (
          <img className={styles.photo} src={HERO_IMAGE} alt="" />
        ) : (
          <span className={styles.placeholder}>Imagem 4K · 2400 × 3000</span>
        )}
        <span className={styles.scrim} aria-hidden="true" />

        <div className={styles.mediaTop}>
          <Logo size="md" />
        </div>

        <blockquote className={styles.quote}>
          <p className={styles.quoteText}>{HERO_PHRASE}</p>
        </blockquote>
      </aside>

      <main className={styles.panel}>
        <div className={styles.formWrap}>
          <div className={styles.brandMobile}>
            <Logo size="md" />
          </div>

          {view === "login" ? (
            <div className={styles.view}>
              <div className={styles.head}>
                <h2 className={styles.title}>Entrar</h2>
                <p className={styles.subtitle}>Acesso para nutricionistas e pacientes.</p>
              </div>

              {error && (
                <Alert variant="error" title="Não foi possível entrar" onClose={() => setError("")}>
                  {error}
                </Alert>
              )}

              <form className={styles.form} onSubmit={handleLogin} noValidate>
                <FormField label="E-mail ou telefone" htmlFor="login-email">
                  <Input
                    id="login-email"
                    type="text"
                    autoComplete="username"
                    placeholder="voce@email.com ou (11) 90000-0000"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    iconLeft={<Icon name="mail" size={20} />}
                  />
                </FormField>

                <FormField label="Senha" htmlFor="login-password">
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    iconLeft={<Icon name="lock" size={20} />}
                  />
                </FormField>

                <div className={styles.rowBetween}>
                  <Checkbox
                    id="login-remember"
                    label="Lembrar de mim"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <button type="button" className={styles.link} onClick={goForgot}>
                    Esqueci a senha
                  </button>
                </div>

                <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
                  Entrar
                </Button>
              </form>

              <p className={styles.footerNote}>
                Ainda não tem acesso? <strong>Fale com a sua nutricionista.</strong>
              </p>
            </div>
          ) : (
            <div className={styles.view}>
              <div className={styles.backRow}>
                <button type="button" className={styles.backBtn} onClick={goLogin}>
                  <Icon name="chevronLeft" size={18} strokeWidth={2} />
                  Voltar ao login
                </button>
              </div>

              <div className={styles.head}>
                <h2 className={styles.title}>Recuperar senha</h2>
                <p className={styles.subtitle}>
                  Enviaremos um link de redefinição para o seu e-mail.
                </p>
              </div>

              {sent ? (
                <Alert variant="success" title="Verifique seu e-mail">
                  Se o e-mail existir, enviamos as instruções de recuperação.
                </Alert>
              ) : (
                <>
                  {error && (
                    <Alert variant="error" title="Atenção" onClose={() => setError("")}>
                      {error}
                    </Alert>
                  )}
                  <form className={styles.form} onSubmit={handleForgot} noValidate>
                    <FormField label="E-mail" htmlFor="forgot-email">
                      <Input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        placeholder="voce@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        iconLeft={<Icon name="mail" size={20} />}
                      />
                    </FormField>
                    <Button type="submit" variant="primary" size="md" fullWidth loading={loading}>
                      Enviar link
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}

          <p className={styles.legal}>Método: BN</p>
        </div>
      </main>
    </div>
  );
}
