"use client";

import { useState } from "react";
import styles from "./page.module.css";

import Button from "@/components/atoms/Button/Button";
import IconButton from "@/components/atoms/IconButton/IconButton";
import Input from "@/components/atoms/Input/Input";
import Textarea from "@/components/atoms/Textarea/Textarea";
import Select from "@/components/atoms/Select/Select";
import Checkbox from "@/components/atoms/Checkbox/Checkbox";
import RadioGroup from "@/components/atoms/RadioGroup/RadioGroup";
import Switch from "@/components/atoms/Switch/Switch";
import Badge from "@/components/atoms/Badge/Badge";
import Avatar from "@/components/atoms/Avatar/Avatar";
import Spinner from "@/components/atoms/Spinner/Spinner";
import Card from "@/components/atoms/Card/Card";
import Divider from "@/components/atoms/Divider/Divider";
import ProgressBar from "@/components/atoms/ProgressBar/ProgressBar";

import FormField from "@/components/molecules/FormField/FormField";
import Modal from "@/components/molecules/Modal/Modal";
import Alert from "@/components/molecules/Alert/Alert";
import Toast from "@/components/molecules/Toast/Toast";
import SearchInput from "@/components/molecules/SearchInput/SearchInput";
import StatCard from "@/components/molecules/StatCard/StatCard";
import Tabs from "@/components/molecules/Tabs/Tabs";

const NAV = [
  { id: "foundations", label: "Tokens" },
  { id: "typography", label: "Tipografia" },
  { id: "buttons", label: "Botões" },
  { id: "forms", label: "Formulários" },
  { id: "feedback", label: "Feedback" },
  { id: "cards", label: "Cards & Stats" },
  { id: "tabs", label: "Tabs" },
  { id: "overlay", label: "Overlay" }
];

const SURFACE_TOKENS = [
  { name: "bg-base", value: "#0E0F12" },
  { name: "bg-subtle", value: "#121319" },
  { name: "surface", value: "#16181D" },
  { name: "surface-elevated", value: "#1E2128" },
  { name: "surface-overlay", value: "#23262E" }
];

const ACCENT_TOKENS = [
  { name: "accent", value: "var(--accent)" },
  { name: "accent-strong", value: "var(--accent-strong)" },
  { name: "accent-contrast", value: "var(--accent-contrast)" },
  { name: "info", value: "var(--info)" },
  { name: "warning", value: "var(--warning)" },
  { name: "danger", value: "var(--danger)" }
];

const TEXT_TOKENS = [
  { name: "text-high", value: "var(--text-high)", sample: "Aa" },
  { name: "text-medium", value: "var(--text-medium)", sample: "Aa" },
  { name: "text-low", value: "var(--text-low)", sample: "Aa" }
];

const TYPE_SCALE = [
  { token: "fs-3xl", size: "var(--fs-3xl)", weight: 700, text: "Nutrição inteligente" },
  { token: "fs-2xl", size: "var(--fs-2xl)", weight: 700, text: "Plano alimentar premium" },
  { token: "fs-xl", size: "var(--fs-xl)", weight: 600, text: "Acompanhamento contínuo" },
  { token: "fs-lg", size: "var(--fs-lg)", weight: 500, text: "Resultados que importam" },
  { token: "fs-md", size: "var(--fs-md)", weight: 400, text: "Corpo de texto padrão da interface" },
  { token: "fs-sm", size: "var(--fs-sm)", weight: 400, text: "Texto de apoio e legendas" },
  { token: "fs-xs", size: "var(--fs-xs)", weight: 500, text: "RÓTULOS E METADADOS" }
];

const SELECT_OPTIONS = [
  { value: "emagrecimento", label: "Emagrecimento" },
  { value: "hipertrofia", label: "Hipertrofia" },
  { value: "manutencao", label: "Manutenção" },
  { value: "clinico", label: "Acompanhamento clínico" }
];

function Section({ id, title, description, children }) {
  return (
    <section id={id} className={styles.section}>
      <header className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {description && <p className={styles.sectionDesc}>{description}</p>}
      </header>
      {children}
    </section>
  );
}

function SubLabel({ children }) {
  return <span className={styles.subLabel}>{children}</span>;
}

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState("Frango grelhado");
  const [goal, setGoal] = useState("emagrecimento");
  const [notify, setNotify] = useState(true);
  const [reminders, setReminders] = useState(false);
  const [tabValue, setTabValue] = useState("resumo");
  const [emailError, setEmailError] = useState("");

  const pushToast = (variant, title, description) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, variant, title, description }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>Nutri DS</span>
          <Badge variant="accent" size="sm">
            v0.1
          </Badge>
        </div>
        <nav className={styles.nav} aria-label="Seções do design system">
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={styles.navLink}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className={styles.content}>
        <section className={styles.hero}>
          <span className={styles.heroKicker}>Design System Atômico</span>
          <h1 className={styles.heroTitle}>
            A linguagem visual da plataforma{" "}
            <span className={styles.heroAccent}>Nutri</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Tokens, átomos e moléculas construídos para uma experiência
            cinematográfica de nutrição. Tema escuro acinzentado, acento verde
            saúde e profundidade sofisticada, com acessibilidade em primeiro
            lugar.
          </p>

          <div className={styles.heroPalette}>
            {SURFACE_TOKENS.map((t) => (
              <span
                key={t.name}
                className={styles.heroSwatch}
                style={{ background: t.value }}
                title={t.value}
              />
            ))}
            <span className={styles.heroSwatchAccent} title="accent gradient" />
          </div>

          <div className={styles.heroActions}>
            <Button size="lg" onClick={() => setModalOpen(true)}>
              Abrir Modal
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() =>
                pushToast(
                  "success",
                  "Plano salvo",
                  "As alterações foram aplicadas com sucesso."
                )
              }
            >
              Disparar Toast
            </Button>
          </div>
        </section>

        <Section
          id="foundations"
          title="Cores & Tokens"
          description="Toda a interface consome estas variáveis. Superfícies em preto acinzentado, acento verde saúde e cores semânticas."
        >
          <div className={styles.grid3}>
            <Card elevation="md" padding="md">
              <SubLabel>Superfícies</SubLabel>
              <div className={styles.tokenList}>
                {SURFACE_TOKENS.map((t) => (
                  <div key={t.name} className={styles.tokenRow}>
                    <span
                      className={styles.tokenSwatch}
                      style={{ background: t.value }}
                    />
                    <span className={styles.tokenName}>--{t.name}</span>
                    <span className={styles.tokenValue}>{t.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card elevation="md" padding="md">
              <SubLabel>Acento & Semânticas</SubLabel>
              <div className={styles.tokenList}>
                {ACCENT_TOKENS.map((t) => (
                  <div key={t.name} className={styles.tokenRow}>
                    <span
                      className={styles.tokenSwatch}
                      style={{ background: t.value }}
                    />
                    <span className={styles.tokenName}>--{t.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card elevation="md" padding="md">
              <SubLabel>Texto & Contraste</SubLabel>
              <div className={styles.textTokens}>
                {TEXT_TOKENS.map((t) => (
                  <div key={t.name} className={styles.textToken}>
                    <span
                      className={styles.textSample}
                      style={{ color: t.value }}
                    >
                      {t.sample}
                    </span>
                    <span className={styles.tokenName}>--{t.name}</span>
                  </div>
                ))}
              </div>
              <Divider />
              <SubLabel>Gradiente de acento</SubLabel>
              <div className={styles.gradientSample} />
              <SubLabel>Raios & Elevação</SubLabel>
              <div className={styles.radiusRow}>
                <span className={styles.radiusChip} data-r="sm" />
                <span className={styles.radiusChip} data-r="md" />
                <span className={styles.radiusChip} data-r="lg" />
                <span className={styles.radiusChip} data-r="xl" />
              </div>
            </Card>
          </div>
        </Section>

        <Section
          id="typography"
          title="Tipografia"
          description="Escala fluida com clamp(), pesos de 400 a 700 e tracking negativo nos títulos para um ar premium."
        >
          <Card elevation="md" padding="lg">
            <div className={styles.typeScale}>
              {TYPE_SCALE.map((t) => (
                <div key={t.token} className={styles.typeRow}>
                  <span className={styles.typeToken}>--{t.token}</span>
                  <span
                    className={styles.typeSample}
                    style={{ fontSize: t.size, fontWeight: t.weight }}
                  >
                    {t.text}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section
          id="buttons"
          title="Botões"
          description="Cinco variantes, três tamanhos e todos os estados: hover, active, disabled e loading."
        >
          <Card elevation="md" padding="lg" className={styles.stack}>
            <div className={styles.specimenGroup}>
              <SubLabel>Variantes</SubLabel>
              <div className={styles.row}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            <Divider />

            <div className={styles.specimenGroup}>
              <SubLabel>Tamanhos</SubLabel>
              <div className={styles.rowBaseline}>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <Divider />

            <div className={styles.specimenGroup}>
              <SubLabel>Estados</SubLabel>
              <div className={styles.row}>
                <Button>Default</Button>
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
                <Button variant="secondary" loading>
                  Salvando
                </Button>
                <Button
                  iconLeft={
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M8 3v10M3 8h10"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                >
                  Com ícone
                </Button>
              </div>
            </div>

            <Divider />

            <div className={styles.specimenGroup}>
              <SubLabel>Icon buttons</SubLabel>
              <div className={styles.row}>
                <IconButton label="Editar" variant="ghost">
                  <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path
                      d="M11.5 3.5l3 3L7 14H4v-3l7.5-7.5z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>
                <IconButton label="Adicionar" variant="solid">
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M8 3v10M3 8h10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </IconButton>
                <IconButton label="Favoritar" variant="accent">
                  <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path
                      d="M9 3l1.8 3.7 4 .6-2.9 2.8.7 4L9 12.2 5.4 14l.7-4L3.2 7.3l4-.6L9 3z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>
                <IconButton label="Bloqueado" variant="solid" disabled>
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </IconButton>
              </div>
            </div>
          </Card>
        </Section>

        <Section
          id="forms"
          title="Inputs & Formulários"
          description="Campos isolados e a molécula FormField com label, helper e estados de erro acessíveis."
        >
          <div className={styles.grid2}>
            <Card elevation="md" padding="lg" className={styles.stack}>
              <FormField label="Nome do paciente" htmlFor="ds-name" required>
                <Input id="ds-name" placeholder="Ex: Maria Silva" />
              </FormField>

              <FormField
                label="E-mail"
                htmlFor="ds-email"
                helper="Usaremos para enviar o plano alimentar."
                error={emailError}
              >
                <Input
                  id="ds-email"
                  type="email"
                  placeholder="maria@email.com"
                  invalid={Boolean(emailError)}
                  onBlur={(e) =>
                    setEmailError(
                      e.target.value.includes("@") ? "" : "Informe um e-mail válido."
                    )
                  }
                  iconLeft={
                    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <rect
                        x="2.5"
                        y="4"
                        width="13"
                        height="10"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M3 5l6 4 6-4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                />
              </FormField>

              <FormField label="Senha" htmlFor="ds-password">
                <Input
                  id="ds-password"
                  type="password"
                  placeholder="••••••••••"
                  iconLeft={
                    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <rect
                        x="3.5"
                        y="8"
                        width="11"
                        height="7.5"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M5.75 8V6a3.25 3.25 0 0 1 6.5 0v2"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                />
              </FormField>

              <FormField label="Objetivo" htmlFor="ds-goal">
                <Select
                  id="ds-goal"
                  options={SELECT_OPTIONS}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </FormField>

              <FormField
                label="Observações clínicas"
                htmlFor="ds-notes"
                optional
              >
                <Textarea
                  id="ds-notes"
                  placeholder="Histórico, restrições, alergias..."
                />
              </FormField>
            </Card>

            <Card elevation="md" padding="lg" className={styles.stack}>
              <SubLabel>Busca</SubLabel>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar alimento..."
              />

              <Divider />

              <SubLabel>Seleção</SubLabel>
              <Checkbox
                id="ds-check-1"
                label="Aceito o termo de consentimento"
                description="Necessário para iniciar o acompanhamento."
                defaultChecked
              />
              <Checkbox
                id="ds-check-2"
                label="Receber newsletter de nutrição"
              />
              <Checkbox
                id="ds-check-3"
                label="Opção desabilitada"
                disabled
              />

              <Divider />

              <SubLabel>Radio group</SubLabel>
              <RadioGroup
                name="ds-meal"
                value={goal}
                onChange={setGoal}
                options={SELECT_OPTIONS}
              />

              <Divider />

              <SubLabel>Switches</SubLabel>
              <Switch
                checked={notify}
                onChange={setNotify}
                label="Notificações por push"
              />
              <Switch
                checked={reminders}
                onChange={setReminders}
                label="Lembretes de refeição"
              />
              <Switch checked disabled label="Desabilitado (ligado)" />
            </Card>
          </div>
        </Section>

        <Section
          id="feedback"
          title="Feedback"
          description="Badges, spinners, barras de progresso e alertas para comunicar estado e progresso."
        >
          <div className={styles.grid2}>
            <Card elevation="md" padding="lg" className={styles.stack}>
              <SubLabel>Badges & Tags</SubLabel>
              <div className={styles.row}>
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="success" dot>
                  Ativo
                </Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="warning">Pendente</Badge>
                <Badge variant="danger">Atrasado</Badge>
              </div>

              <Divider />

              <SubLabel>Avatares</SubLabel>
              <div className={styles.rowBaseline}>
                <Avatar name="Maria Silva" size="sm" status="online" />
                <Avatar name="João Pereira" size="md" status="busy" />
                <Avatar name="Ana Costa" size="lg" status="offline" />
                <Avatar size="md" />
              </div>

              <Divider />

              <SubLabel>Spinners</SubLabel>
              <div className={styles.rowBaseline}>
                <Spinner size="sm" tone="accent" />
                <Spinner size="md" tone="accent" />
                <Spinner size="lg" tone="muted" />
              </div>
            </Card>

            <Card elevation="md" padding="lg" className={styles.stack}>
              <SubLabel>Progresso</SubLabel>
              <ProgressBar value={72} showValue label="Meta de hidratação" />
              <ProgressBar value={40} variant="info" label="Proteínas" showValue />
              <ProgressBar value={88} variant="warning" label="Carboidratos" showValue />
              <ProgressBar indeterminate label="Sincronizando..." />

              <Divider />

              <SubLabel>Alertas inline</SubLabel>
              <Alert variant="success" title="Plano publicado">
                O paciente já pode visualizar o novo plano alimentar.
              </Alert>
              <Alert variant="warning" title="Anamnese incompleta">
                Faltam 2 campos obrigatórios para liberar o plano.
              </Alert>
              <Alert variant="error" title="Falha ao salvar" onClose={() => {}}>
                Verifique sua conexão e tente novamente.
              </Alert>
            </Card>
          </div>

          <Card elevation="md" padding="lg" className={styles.stack}>
            <SubLabel>Toasts (notificações temporárias)</SubLabel>
            <div className={styles.row}>
              <Button
                variant="outline"
                onClick={() =>
                  pushToast(
                    "success",
                    "Refeição registrada",
                    "Café da manhã adicionado ao diário."
                  )
                }
              >
                Toast sucesso
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  pushToast(
                    "error",
                    "Erro de sincronização",
                    "Não foi possível conectar ao servidor."
                  )
                }
              >
                Toast erro
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  pushToast(
                    "info",
                    "Dica do dia",
                    "Lembre-se de beber água entre as refeições."
                  )
                }
              >
                Toast info
              </Button>
            </div>
          </Card>
        </Section>

        <Section
          id="cards"
          title="Cards & Stats"
          description="Cartões com elevação e métricas premium com tendência, ícone e contexto."
        >
          <div className={styles.grid4}>
            <StatCard
              label="Pacientes ativos"
              value="248"
              trend="12%"
              trendDirection="up"
              helper="vs. mês anterior"
              icon={
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M4 16c0-3 2.7-5 6-5s6 2 6 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
            <StatCard
              label="Adesão ao plano"
              value="92"
              unit="%"
              trend="4%"
              trendDirection="up"
              helper="média semanal"
              accent
            />
            <StatCard
              label="Consultas hoje"
              value="14"
              trend="2"
              trendDirection="down"
              helper="3 remarcações"
            />
            <StatCard
              label="Planos pendentes"
              value="7"
              helper="aguardando revisão"
              icon={
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
          </div>

          <div className={styles.grid3}>
            <Card elevation="sm" padding="lg">
              <SubLabel>Elevation sm</SubLabel>
              <p className={styles.cardText}>
                Superfície sutil para agrupamentos internos e listas.
              </p>
            </Card>
            <Card elevation="md" padding="lg" interactive>
              <SubLabel>Interactive</SubLabel>
              <p className={styles.cardText}>
                Passe o mouse: elevação e leve translação para indicar ação.
              </p>
            </Card>
            <Card elevation="lg" padding="lg">
              <SubLabel>Elevation lg</SubLabel>
              <p className={styles.cardText}>
                Destaque máximo para conteúdo em foco e modais embutidos.
              </p>
            </Card>
          </div>
        </Section>

        <Section
          id="tabs"
          title="Tabs"
          description="Navegação por abas com teclado (setas, Home/End), três variantes e painel acessível."
        >
          <Card elevation="md" padding="lg" className={styles.stack}>
            <Tabs
              variant="line"
              value={tabValue}
              onChange={setTabValue}
              items={[
                {
                  value: "resumo",
                  label: "Resumo",
                  content: (
                    <p className={styles.cardText}>
                      Visão geral do paciente, metas e progresso recente.
                    </p>
                  )
                },
                {
                  value: "plano",
                  label: "Plano alimentar",
                  badge: 5,
                  content: (
                    <p className={styles.cardText}>
                      5 refeições configuradas com substituições inteligentes.
                    </p>
                  )
                },
                {
                  value: "anamnese",
                  label: "Anamnese",
                  content: (
                    <p className={styles.cardText}>
                      Histórico clínico, hábitos e restrições alimentares.
                    </p>
                  )
                },
                { value: "bloqueado", label: "Faturamento", disabled: true }
              ]}
            />

            <Divider label="Outras variantes" />

            <div className={styles.tabsVariants}>
              <Tabs
                variant="pill"
                items={[
                  { value: "dia", label: "Dia" },
                  { value: "semana", label: "Semana" },
                  { value: "mes", label: "Mês" }
                ]}
              />
              <Tabs
                variant="segment"
                items={[
                  { value: "ativos", label: "Ativos", badge: 248 },
                  { value: "inativos", label: "Inativos", badge: 31 }
                ]}
              />
            </div>
          </Card>
        </Section>

        <Section
          id="overlay"
          title="Overlay & Modal"
          description="Modal com overlay desfocado, animação de entrada, fechamento por ESC e backdrop, e foco preso."
        >
          <Card elevation="md" padding="lg" className={styles.row}>
            <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>
            <Button
              variant="secondary"
              onClick={() =>
                pushToast("info", "Atalho", "ESC fecha o modal e devolve o foco.")
              }
            >
              Sobre acessibilidade
            </Button>
          </Card>
        </Section>

        <footer className={styles.footer}>
          <span>Nutri Design System — etapa 1 de fundações.</span>
          <span className={styles.footerMuted}>
            Construído com Next.js App Router e CSS Modules.
          </span>
        </footer>
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirmar publicação do plano"
        description="O paciente será notificado e poderá visualizar o plano imediatamente."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setModalOpen(false);
                pushToast("success", "Plano publicado", "O paciente foi notificado.");
              }}
            >
              Publicar plano
            </Button>
          </>
        }
      >
        <p className={styles.modalText}>
          Revise os macronutrientes antes de publicar. Esta ação registra a
          versão atual e envia uma notificação ao paciente.
        </p>
        <FormField label="Mensagem ao paciente" htmlFor="ds-modal-msg" optional>
          <Textarea
            id="ds-modal-msg"
            rows={3}
            placeholder="Adicione orientações personalizadas..."
          />
        </FormField>
      </Modal>

      <div className={styles.toastViewport} aria-live="polite">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            title={t.title}
            description={t.description}
            onDismiss={() => removeToast(t.id)}
          />
        ))}
      </div>
    </div>
  );
}
