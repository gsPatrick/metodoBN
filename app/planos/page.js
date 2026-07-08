"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

import AppShell from "@/components/organisms/AppShell/AppShell";
import Card from "@/components/atoms/Card/Card";
import Icon from "@/components/atoms/Icon/Icon";
import Button from "@/components/atoms/Button/Button";
import FinishFlow from "@/components/molecules/FinishFlow/FinishFlow";

function humanSize(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function PlanosPage() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState("upload"); // upload | sending | done

  function onPick(e) {
    const f = e.target.files && e.target.files[0];
    if (f) setFile(f);
  }

  return (
    <AppShell active="planos" title="Enviar plano">
      <div className={styles.page}>
        {phase === "upload" && (
          <Card elevation="sm" padding="lg">
            <div className={styles.head}>
              <span className={styles.headIcon}>
                <Icon name="upload" size={26} />
              </span>
              <span>
                <h1 className={styles.title}>Enviar plano alimentar</h1>
                <p className={styles.sub}>Faça o upload do plano alimentar para enviar ao paciente.</p>
              </span>
            </div>

            <button type="button" className={styles.drop} onClick={() => inputRef.current && inputRef.current.click()}>
              {file ? (
                <>
                  <span className={styles.dropIcon}>
                    <Icon name="fileDoc" size={28} />
                  </span>
                  <span className={styles.dropTitle}>{file.name}</span>
                  <span className={styles.dropHint}>{humanSize(file.size)}</span>
                  <span className={styles.dropChange}>Trocar arquivo</span>
                </>
              ) : (
                <>
                  <span className={styles.dropIcon}>
                    <Icon name="upload" size={28} />
                  </span>
                  <span className={styles.dropTitle}>Clique para selecionar o arquivo</span>
                  <span className={styles.dropHint}>Plano alimentar (PDF)</span>
                </>
              )}
            </button>
            <input ref={inputRef} type="file" accept=".pdf,.xlsx,.xls,.csv,image/*" hidden onChange={onPick} />

            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                Cancelar
              </Button>
              <Button onClick={() => setPhase("sending")} disabled={!file} iconRight={<Icon name="arrowRight" size={18} />}>
                Enviar plano
              </Button>
            </div>
          </Card>
        )}

        {phase === "sending" && (
          <Card elevation="sm" padding="lg">
            <FinishFlow
              steps={[
                { icon: "upload", phrase: "Recebendo o plano alimentar…" },
                { icon: "clipboard", phrase: "Salvando na ficha do paciente…" },
                { icon: "chat", phrase: "Avisando o paciente…" },
                { icon: "check", phrase: "Plano enviado! 🎉" }
              ]}
              onDone={() => setPhase("done")}
            />
          </Card>
        )}

        {phase === "done" && (
          <Card elevation="sm" padding="lg">
            <div className={styles.done}>
              <span className={styles.doneIcon}>
                <Icon name="check" size={38} strokeWidth={2.4} />
              </span>
              <h1 className={styles.doneTitle}>Plano enviado!</h1>
              <p className={styles.doneSub}>
                O paciente já recebeu o plano por e-mail e WhatsApp e pode acessar pelo app.
              </p>
              <div className={styles.doneActions}>
                <Button onClick={() => router.push("/dashboard")} iconRight={<Icon name="arrowRight" size={18} />}>
                  Voltar ao início
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFile(null);
                    setPhase("upload");
                  }}
                >
                  Enviar outro
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
