"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

import AppShell from "@/components/organisms/AppShell/AppShell";
import Icon from "@/components/atoms/Icon/Icon";
import Button from "@/components/atoms/Button/Button";
import Fruit from "@/components/atoms/Fruit/Fruit";
import Skeleton from "@/components/atoms/Skeleton/Skeleton";
import EmptyState from "@/components/molecules/EmptyState/EmptyState";
import Modal from "@/components/molecules/Modal/Modal";
import { apiGet, apiDelete } from "@/lib/api";

const FRUITS = ["morango", "banana", "laranja", "maca"];
const SEX_LABEL = { male: "Masculino", female: "Feminino", other: "Outro" };

function initials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
function ageFrom(birthDate) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a -= 1;
  return a >= 0 && a < 130 ? a : null;
}

function PatientCard({ p, fruit, onClick, onDelete }) {
  const name = (p.user && p.user.name) || "Paciente";
  const age = ageFrom(p.birthDate);
  const sub = [SEX_LABEL[p.sex] || null, age != null ? `${age} anos` : null].filter(Boolean).join(" · ") || "Sem dados";
  const active = !p.user || p.user.isActive !== false;
  return (
    // div (não button): o card tem um botão de excluir dentro — button aninhado é inválido
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.cardTop}>
        <Fruit name={fruit} fallback="apple" size={44} className={styles.cardFruit} />
      </div>
      <button
        type="button"
        className={styles.cardDelete}
        aria-label={`Excluir ${name}`}
        title="Excluir paciente"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Icon name="trash" size={16} />
      </button>
      <span className={styles.cardAvatar}>{initials(name)}</span>
      <div className={styles.cardBody}>
        <span className={styles.cardName}>{name}</span>
        <span className={styles.cardObj}>{sub}</span>
        <div className={styles.cardMeta}>
          <span className={`${styles.badge} ${active ? styles.badgeActive : styles.badgeNew}`}>{active ? "Ativo" : "Inativo"}</span>
        </div>
        <span className={styles.cardVisit}>
          <Icon name="clipboard" size={14} /> Ver ficha completa
        </span>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop} />
      <span className={styles.cardAvatar}>
        <Skeleton circle width={56} height={56} />
      </span>
      <div className={styles.cardBody}>
        <Skeleton width="70%" height={18} />
        <Skeleton width="50%" height={13} />
        <Skeleton width={64} height={18} radius="var(--radius-pill)" />
        <Skeleton width="55%" height={12} />
      </div>
    </div>
  );
}

export default function PacientesPage() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState(null); // null = carregando
  const [error, setError] = useState(null);
  const [toDelete, setToDelete] = useState(null); // paciente aguardando confirmação
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  async function load() {
    setError(null);
    setPatients(null);
    try {
      const data = await apiGet("/users/patients");
      setPatients(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e && e.message ? e.message : "Erro ao carregar.");
      setPatients([]);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function askDelete(p) {
    setDeleteError(null);
    setToDelete(p);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiDelete(`/users/profiles/${toDelete.id}`);
      setPatients((prev) => (prev || []).filter((p) => p.id !== toDelete.id));
      setToDelete(null);
    } catch (e) {
      setDeleteError(e && e.message ? e.message : "Não foi possível excluir o paciente.");
    } finally {
      setDeleting(false);
    }
  }

  const list = useMemo(() => {
    if (!patients) return [];
    const t = q.trim().toLowerCase();
    if (!t) return patients;
    return patients.filter((p) => ((p.user && p.user.name) || "").toLowerCase().includes(t));
  }, [patients, q]);

  const loading = patients === null;

  return (
    <AppShell active="pacientes" title="Pacientes">
      <div className={styles.page}>
        <header className={styles.head}>
          <Fruit name="banana" fallback="banana" size={56} className={`${styles.headFruit} ${styles.hf1}`} />
          <Fruit name="laranja" fallback="orange" size={48} className={`${styles.headFruit} ${styles.hf2}`} />
          <div className={styles.headText}>
            <h1 className={styles.title}>Seus pacientes</h1>
            <p className={styles.sub}>{loading ? "Carregando…" : `${patients.length} no total`}</p>
          </div>
          <button type="button" className={styles.newBtn} onClick={() => router.push("/pacientes/novo")}>
            <Icon name="plus" size={18} /> Novo paciente
          </button>
        </header>

        <div className={styles.toolbar}>
          <span className={styles.search}>
            <Icon name="search" size={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar paciente…" disabled={loading} />
          </span>
        </div>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            variant="error"
            icon="help"
            title="Não foi possível carregar"
            message={error}
            action={
              <button type="button" className={styles.newBtn} onClick={load}>
                <Icon name="more" size={18} /> Tentar de novo
              </button>
            }
          />
        ) : list.length === 0 ? (
          <EmptyState
            fruit="salada"
            title={q ? "Nenhum paciente encontrado" : "Nenhum paciente ainda"}
            message={q ? `Nada para “${q}”.` : "Cadastre seu primeiro paciente para começar o acompanhamento."}
            action={
              !q && (
                <button type="button" className={styles.newBtn} onClick={() => router.push("/pacientes/novo")}>
                  <Icon name="plus" size={18} /> Novo paciente
                </button>
              )
            }
          />
        ) : (
          <div className={styles.grid}>
            {list.map((p, i) => (
              <PatientCard
                key={p.id}
                p={p}
                fruit={FRUITS[i % FRUITS.length]}
                onClick={() => router.push(`/pacientes/${p.id}`)}
                onDelete={() => askDelete(p)}
              />
            ))}
          </div>
        )}

        <Modal
          open={!!toDelete}
          onClose={deleting ? undefined : () => setToDelete(null)}
          closeOnBackdrop={!deleting}
          closeOnEsc={!deleting}
          title="Excluir paciente"
          description={toDelete ? `Tem certeza que deseja excluir ${(toDelete.user && toDelete.user.name) || "este paciente"}?` : ""}
          footer={
            <>
              <Button variant="ghost" onClick={() => setToDelete(null)} disabled={deleting}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmDelete} loading={deleting} iconLeft={<Icon name="trash" size={18} />}>
                Excluir paciente
              </Button>
            </>
          }
        >
          <p className={styles.deleteWarn}>
            Essa ação é <strong>permanente</strong>: a conta do paciente e todos os dados vinculados (anamnese, plano
            alimentar, conversas e histórico) serão removidos e não poderão ser recuperados.
          </p>
          {deleteError && (
            <p className={styles.deleteError}>
              <Icon name="help" size={16} /> {deleteError}
            </p>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
