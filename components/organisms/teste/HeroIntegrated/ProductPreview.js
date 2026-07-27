"use client";

import Link from "next/link";
import styles from "./ProductPreview.module.css";

const SCREENS = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/login",
    title: "Painel da nutricionista",
    hint: "Pacientes · Anamnese · Planos",
  },
  {
    id: "plano",
    label: "Plano alimentar",
    href: "/login",
    title: "Editor de plano",
    hint: "Refeições · Macros · PDF",
  },
  {
    id: "chat",
    label: "Chat",
    href: "/login",
    title: "Acompanhamento diário",
    hint: "Mensagens · Fotos · Áudio",
  },
];

function DashboardMock() {
  return (
    <div className={styles.mock}>
      <div className={styles.mockTop}>
        <span className={styles.mockDot} />
        <span className={styles.mockDot} />
        <span className={styles.mockDot} />
        <span className={styles.mockTitle}>Método BN</span>
      </div>
      <div className={styles.mockBody}>
        <div className={styles.mockSidebar}>
          <span className={styles.mockNavActive}>Pacientes</span>
          <span>Anamnese</span>
          <span>Planos</span>
          <span>Chat</span>
        </div>
        <div className={styles.mockMain}>
          <div className={styles.mockRow}>
            <span className={styles.mockAvatar} />
            <div>
              <strong>Maria Silva</strong>
              <p>Retorno em 3 dias</p>
            </div>
          </div>
          <div className={styles.mockRow}>
            <span className={styles.mockAvatar} />
            <div>
              <strong>João Costa</strong>
              <p>Plano atualizado</p>
            </div>
          </div>
          <div className={styles.mockRow}>
            <span className={styles.mockAvatar} />
            <div>
              <strong>Ana Pereira</strong>
              <p>Nova anamnese</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanoMock() {
  return (
    <div className={styles.mock}>
      <div className={styles.mockTop}>
        <span className={styles.mockDot} />
        <span className={styles.mockDot} />
        <span className={styles.mockDot} />
        <span className={styles.mockTitle}>Plano alimentar</span>
      </div>
      <div className={styles.mockBodySingle}>
        <div className={styles.mealCard}>
          <span>Café da manhã</span>
          <strong>08:00</strong>
          <p>Iogurte + granola + frutas</p>
        </div>
        <div className={styles.mealCard}>
          <span>Almoço</span>
          <strong>12:30</strong>
          <p>Arroz · Feijão · Frango · Salada</p>
        </div>
        <div className={styles.mealCardAccent}>
          <span>Meta do dia</span>
          <strong>1.840 kcal</strong>
        </div>
      </div>
    </div>
  );
}

function ChatMock() {
  return (
    <div className={styles.mock}>
      <div className={styles.mockTop}>
        <span className={styles.mockDot} />
        <span className={styles.mockDot} />
        <span className={styles.mockDot} />
        <span className={styles.mockTitle}>Chat</span>
      </div>
      <div className={styles.mockBodySingle}>
        <div className={styles.bubbleLeft}>Bom dia! Como foi o café?</div>
        <div className={styles.bubbleRight}>Tomei tudo certinho ✅</div>
        <div className={styles.bubbleLeft}>Ótimo — mantém a hidratação hoje.</div>
      </div>
    </div>
  );
}

const MOCK_MAP = {
  dashboard: DashboardMock,
  plano: PlanoMock,
  chat: ChatMock,
};

export default function ProductPreview({ activeStep = 0, visible = false }) {
  return (
    <div className={`${styles.wrap} ${visible ? styles.visible : ""}`} aria-hidden={!visible}>
      {SCREENS.map((screen, index) => {
        const Mock = MOCK_MAP[screen.id];
        const isActive = index === activeStep;
        return (
          <Link
            key={screen.id}
            href={screen.href}
            className={`${styles.frame} ${isActive ? styles.active : ""}`}
            aria-label={`Abrir ${screen.title}`}
            tabIndex={visible && isActive ? 0 : -1}
          >
            <div className={styles.frameMeta}>
              <span className={styles.frameLabel}>{screen.label}</span>
              <span className={styles.frameHint}>{screen.hint}</span>
            </div>
            <Mock />
            <span className={styles.frameCta}>Abrir no sistema →</span>
          </Link>
        );
      })}
    </div>
  );
}
