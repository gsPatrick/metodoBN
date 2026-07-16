"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AppShell.module.css";

import Logo from "@/components/atoms/Logo/Logo";
import Icon from "@/components/atoms/Icon/Icon";
import Avatar from "@/components/atoms/Avatar/Avatar";
import Badge from "@/components/atoms/Badge/Badge";
import { getCurrentUser, clearSession, apiGet } from "@/lib/api";
import { onNewMessage } from "@/lib/socket";

const ROLE_LABEL = { nutritionist: "Nutricionista", patient: "Paciente", admin: "Administrador" };

const NAV_BASE = [
  { key: "inicio", label: "Início", icon: "grid", href: "/dashboard" },
  { key: "pacientes", label: "Pacientes", icon: "users", href: "/pacientes" },
  { key: "mensagens", label: "Mensagens", icon: "chat", href: "/mensagens" },
  { key: "ajustes", label: "Ajustes", icon: "settings", href: "/ajustes" }
];

const TABS = [
  { key: "inicio", label: "Início", icon: "grid", href: "/dashboard" },
  { key: "pacientes", label: "Pacientes", icon: "users", href: "/pacientes" },
  { key: "_novo", label: "", icon: "plus", center: true, href: "/pacientes/novo" },
  { key: "mensagens", label: "Mensagens", icon: "chat", href: "/mensagens" },
  { key: "ajustes", label: "Ajustes", icon: "settings", href: "/ajustes" }
];

export default function AppShell({
  active = "inicio",
  title = "",
  user = null,
  actions = null,
  flush = false,
  children
}) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [me, setMe] = useState(null);
  const [unread, setUnread] = useState(0);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    setMe(getCurrentUser());
  }, []);

  // Total de não-lidas para o badge — recalcula no boot, em realtime e ao marcar como lida.
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const list = await apiGet("/conversations");
        if (!active) return;
        const total = (Array.isArray(list) ? list : []).reduce((n, c) => n + (c.nutriUnread || 0), 0);
        setUnread(total);
      } catch {
        /* ignora */
      }
    }
    refresh();
    const unsub = onNewMessage(() => refresh()); // mensagem nova → recalcula
    const onRefresh = () => refresh(); // disparado ao abrir/ler uma conversa
    window.addEventListener("bn-unread-refresh", onRefresh);
    return () => {
      active = false;
      unsub();
      window.removeEventListener("bn-unread-refresh", onRefresh);
    };
  }, []);

  const resolvedUser = user || {
    name: (me && me.name) || "Nutricionista",
    role: (me && ROLE_LABEL[me.role]) || "Nutricionista"
  };

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  const nav = NAV_BASE;

  useEffect(() => {
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > lastY.current && y > 80) setHidden(true);
        else if (y < lastY.current) setHidden(false);
        lastY.current = y;
        ticking.current = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <Logo size="md" showName />
        </div>

        <nav className={styles.nav}>
          {nav.map((item) => {
            const badge = item.key === "mensagens" ? (unread > 0 ? unread : null) : item.badge;
            return (
              <a
                key={item.key}
                href={item.href}
                className={`${styles.navItem} ${active === item.key ? styles.navActive : ""}`}
                aria-current={active === item.key ? "page" : undefined}
              >
                <span className={styles.navIcon}>
                  <Icon name={item.icon} size={20} />
                </span>
                {item.label}
                {badge ? (
                  <span className={styles.navBadge}>
                    <Badge variant="success" size="sm">
                      {badge}
                    </Badge>
                  </span>
                ) : null}
              </a>
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          <div className={styles.sidebarArt}>
            <img className={styles.sidebarSalad} src="/fruits/salada.png" alt="" aria-hidden="true" />
            <span className={styles.sidebarArtText}>Bons atendimentos! 🥗</span>
          </div>
          <div className={styles.userCard}>
            <Avatar name={resolvedUser.name} size="sm" status="online" />
            <span className={styles.userText}>
              <span className={styles.userName}>{resolvedUser.name}</span>
              <span className={styles.userRole}>{resolvedUser.role}</span>
            </span>
          </div>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            <Icon name="logout" size={18} />
            Sair
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={`${styles.header} ${hidden ? styles.headerHidden : ""}`}>
          <span className={styles.title}>{title}</span>
          <span className={styles.brandMobile}>
            <Logo size="sm" showName />
          </span>

          <div className={styles.headerActions}>
            {actions}
            <button type="button" className={styles.iconBtn} aria-label="Notificações">
              <Icon name="bell" size={20} />
              {unread > 0 && <span className={styles.dotBadge} aria-hidden="true" />}
            </button>
            <span className={styles.headerAvatar}>
              <Avatar name={resolvedUser.name} size="sm" status="online" />
            </span>
          </div>
        </header>

        <main className={`${styles.content} ${flush ? styles.contentFlush : ""}`}>{children}</main>
      </div>

      <nav className={styles.bottomNav} aria-label="Navegação">
        {TABS.map((t) =>
          t.center ? (
            <a key={t.key} href={t.href} className={styles.tabCenter} aria-label="Cadastrar paciente">
              <Icon name={t.icon} size={24} strokeWidth={2.2} />
            </a>
          ) : (
            <a
              key={t.key}
              href={t.href}
              className={`${styles.tab} ${active === t.key ? styles.tabActive : ""}`}
            >
              <Icon name={t.icon} size={22} />
              {t.label}
            </a>
          )
        )}
      </nav>
    </div>
  );
}
