"use client";

import { useState } from "react";
import styles from "./page.module.css";

import Avatar from "@/components/atoms/Avatar/Avatar";
import Button from "@/components/atoms/Button/Button";
import Input from "@/components/atoms/Input/Input";
import Switch from "@/components/atoms/Switch/Switch";
import Checkbox from "@/components/atoms/Checkbox/Checkbox";
import RadioGroup from "@/components/atoms/RadioGroup/RadioGroup";
import Badge from "@/components/atoms/Badge/Badge";
import Divider from "@/components/atoms/Divider/Divider";
import ProgressBar from "@/components/atoms/ProgressBar/ProgressBar";
import Icon from "@/components/atoms/Icon/Icon";
import FormField from "@/components/molecules/FormField/FormField";
import SearchInput from "@/components/molecules/SearchInput/SearchInput";
import StatCard from "@/components/molecules/StatCard/StatCard";
import Tabs from "@/components/molecules/Tabs/Tabs";
import Alert from "@/components/molecules/Alert/Alert";

const GOAL_OPTIONS = [
  { value: "lose", label: "Emagrecimento" },
  { value: "gain", label: "Hipertrofia" },
  { value: "keep", label: "Manutenção" }
];

const TAB_ITEMS = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" }
];

const ICON_GALLERY = [
  "leaf", "apple", "water", "flame", "carrot",
  "utensils", "scale", "dumbbell", "activity", "pill",
  "cart", "target", "chart", "heart", "star",
  "calendar", "clock", "user", "bell", "settings"
];

const SETTINGS = [
  { icon: "globe", label: "Idioma", sub: "Português (BR)", type: "link" },
  { icon: "moon", label: "Modo escuro", type: "switch", key: "darkMode" },
  { icon: "pin", label: "Localização", type: "switch", key: "location" },
  { icon: "bell", label: "Notificações", type: "switch", key: "notify" },
  { icon: "help", label: "Central de ajuda", type: "link" },
  { icon: "logout", label: "Sair", type: "link", danger: true }
];

export default function MobileDesignSystem() {
  const [name, setName] = useState("Beatriz Nascimento");
  const [email, setEmail] = useState("bia@nutri.app");
  const [search, setSearch] = useState("");
  const [goal, setGoal] = useState("lose");
  const [tab, setTab] = useState("dia");
  const [toggles, setToggles] = useState({ darkMode: true, location: true, notify: false });
  const [nav, setNav] = useState("profile");

  const setToggle = (key) => (v) => setToggles((s) => ({ ...s, [key]: v }));

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <span className={styles.headTitle}>Design System · Mobile</span>
        <a className={styles.headLink} href="/design-system">
          Ver desktop →
        </a>
      </div>

      <div className={styles.device}>
        <div className={styles.screen}>
          <div className={styles.statusbar}>
            <span>9:41</span>
            <span className={styles.statusIcons}>
              <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true"><rect x="0" y="7" width="3" height="5" rx="1" /><rect x="5" y="4" width="3" height="8" rx="1" /><rect x="10" y="1" width="3" height="11" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" opacity="0.4" /></svg>
              <svg width="22" height="12" viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="1" y="2" width="18" height="10" rx="3" /><rect x="3" y="4" width="13" height="6" rx="1.5" fill="currentColor" /><path d="M21 5v4" /></svg>
            </span>
          </div>

          <header className={styles.appbar}>
            <button className={styles.appbarBtn} aria-label="Voltar">
              <Icon name="chevronLeft" size={22} strokeWidth={2} />
            </button>
            <span className={styles.appbarTitle}>Componentes</span>
            <button className={styles.appbarBtn} aria-label="Notificações">
              <Icon name="bell" size={21} />
            </button>
          </header>

          <div className={styles.scroll}>
            {/* Perfil */}
            <section className={styles.profile}>
              <Avatar name="Beatriz Nascimento" size="lg" status="online" />
              <span className={styles.profileName}>{name}</span>
              <span className={styles.profileRole}>Nutricionista · Premium</span>
              <div className={styles.badges}>
                <Badge variant="success" dot>
                  Ativo
                </Badge>
                <Badge variant="neutral">248 pacientes</Badge>
              </div>
            </section>

            {/* Métricas */}
            <section className={styles.section}>
              <span className={styles.eyebrow}>Hoje</span>
              <div className={styles.grid2}>
                <StatCard label="Calorias" value="1.850" unit="kcal" trend="8%" trendDirection="up" icon={<Icon name="flame" size={18} />} />
                <StatCard label="Adesão" value="92" unit="%" trend="5%" trendDirection="up" accent icon={<Icon name="target" size={18} />} />
              </div>
            </section>

            {/* Formulário (estilo Edit Profile) */}
            <section className={styles.section}>
              <span className={styles.eyebrow}>Editar perfil</span>
              <div className={styles.formStack}>
                <FormField label="Nome completo" htmlFor="m-name">
                  <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} iconLeft={<Icon name="user" size={20} />} />
                </FormField>
                <FormField label="E-mail" htmlFor="m-email">
                  <Input id="m-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} iconLeft={<Icon name="mail" size={20} />} />
                </FormField>
                <FormField label="Senha" htmlFor="m-pass">
                  <Input id="m-pass" type="password" placeholder="••••••••••" iconLeft={<Icon name="lock" size={20} />} />
                </FormField>
              </div>
            </section>

            {/* Settings (lista com switches) */}
            <section className={styles.section}>
              <span className={styles.eyebrow}>Configurações</span>
              <div className={styles.listCard}>
                {SETTINGS.map((item) => (
                  <div className={styles.row} key={item.label}>
                    <span className={`${styles.rowIcon} ${item.danger ? styles.rowDanger : ""}`}>
                      <Icon name={item.icon} size={18} />
                    </span>
                    <span className={styles.rowBody}>
                      <span className={styles.rowLabel}>{item.label}</span>
                      {item.sub && <span className={styles.rowSub}>{item.sub}</span>}
                    </span>
                    {item.type === "switch" ? (
                      <Switch checked={toggles[item.key]} onChange={setToggle(item.key)} label={item.label} hideLabel />
                    ) : (
                      <span className={styles.rowTrailing}>
                        <Icon name="chevronRight" size={18} strokeWidth={2} />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Seleção */}
            <section className={styles.section}>
              <span className={styles.eyebrow}>Objetivo</span>
              <RadioGroup name="m-goal" value={goal} onChange={setGoal} options={GOAL_OPTIONS} />
              <Divider />
              <Checkbox id="m-terms" label="Aceito os termos de consentimento" description="Necessário para iniciar o acompanhamento." defaultChecked />
              <Checkbox id="m-news" label="Receber lembretes por push" />
            </section>

            {/* Busca + Tabs */}
            <section className={styles.section}>
              <span className={styles.eyebrow}>Explorar</span>
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar alimento..." />
              <Tabs variant="pill" value={tab} onChange={setTab} items={TAB_ITEMS} />
              <ProgressBar value={62} label="Meta de água" showValue />
            </section>

            {/* Ícones */}
            <section className={styles.section}>
              <span className={styles.eyebrow}>Ícones</span>
              <div className={styles.iconGrid}>
                {ICON_GALLERY.map((n) => (
                  <span className={styles.iconTile} key={n}>
                    <Icon name={n} size={22} />
                  </span>
                ))}
              </div>
            </section>

            {/* Alerta */}
            <Alert variant="success" title="Plano aprovado">
              O plano alimentar foi liberado para o paciente.
            </Alert>

            {/* Ações */}
            <section className={styles.section}>
              <span className={styles.eyebrow}>Ações</span>
              <div className={styles.btnStack}>
                <Button variant="primary" size="md" fullWidth iconLeft={<Icon name="check" size={18} strokeWidth={2.1} />}>
                  Salvar plano
                </Button>
                <Button variant="secondary" size="md" fullWidth>
                  Pré-visualizar
                </Button>
                <Button variant="ghost" size="md" fullWidth>
                  Descartar alterações
                </Button>
              </div>
            </section>
          </div>

          {/* Bottom nav */}
          <nav className={styles.navBar} aria-label="Navegação">
            <button className={`${styles.navItem} ${nav === "home" ? styles.navItemActive : ""}`} onClick={() => setNav("home")} aria-label="Início">
              <Icon name="home" size={22} />
            </button>
            <button className={`${styles.navItem} ${nav === "search" ? styles.navItemActive : ""}`} onClick={() => setNav("search")} aria-label="Buscar">
              <Icon name="search" size={22} />
            </button>
            <button className={styles.navCenter} aria-label="Adicionar">
              <Icon name="plus" size={24} strokeWidth={2.2} />
            </button>
            <button className={`${styles.navItem} ${nav === "fav" ? styles.navItemActive : ""}`} onClick={() => setNav("fav")} aria-label="Favoritos">
              <Icon name="heart" size={22} />
            </button>
            <button className={`${styles.navItem} ${nav === "profile" ? styles.navItemActive : ""}`} onClick={() => setNav("profile")} aria-label="Perfil">
              <Icon name="user" size={22} />
            </button>
          </nav>
        </div>
      </div>

      <p className={styles.caption}>
        Prévia mobile real (390px) com os componentes touch-otimizados: ícones do set local,
        inputs em pílula, switches macios, listas de toque e bottom navigation.
      </p>
    </div>
  );
}
