"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import styles from "./UploadProvider.module.css";
import Icon from "@/components/atoms/Icon/Icon";
import { apiPost } from "@/lib/api";

const UploadCtx = createContext(null);
export const useUpload = () => useContext(UploadCtx) || { uploads: {}, startImport: () => {}, dismissUpload: () => {}, toast: () => {} };

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function Toaster({ toasts, onClose }) {
  return (
    <div className={styles.toaster} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.variant] || ""}`} role="status">
          <span className={styles.toastIcon}>
            <Icon name={t.variant === "error" ? "help" : "check"} size={18} strokeWidth={2.4} />
          </span>
          <span className={styles.toastMsg}>{t.msg}</span>
          <button type="button" className={styles.toastClose} onClick={() => onClose(t.id)} aria-label="Fechar">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function UploadProvider({ children }) {
  // uploads[profileId] = { status: 'uploading'|'done'|'error', progress, plan, error, name }
  const [uploads, setUploads] = useState({});
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});
  const idRef = useRef(0);

  const closeToast = useCallback((tid) => setToasts((t) => t.filter((x) => x.id !== tid)), []);
  const toast = useCallback((msg, variant = "success") => {
    idRef.current += 1;
    const tid = idRef.current;
    setToasts((t) => [...t, { id: tid, msg, variant }]);
    setTimeout(() => closeToast(tid), 4600);
  }, [closeToast]);

  const patchUp = useCallback((pid, patch) => {
    setUploads((u) => ({ ...u, [pid]: { ...(u[pid] || {}), ...patch } }));
  }, []);

  const dismissUpload = useCallback((pid) => {
    clearInterval(timers.current[pid]);
    setUploads((u) => {
      const n = { ...u };
      delete n[pid];
      return n;
    });
  }, []);

  // Importa o PDF do plano alimentar em background, com progresso animado.
  const startImport = useCallback(
    async (profileId, file, opts = {}) => {
      const name = opts.patientName || "paciente";
      patchUp(profileId, { status: "uploading", progress: 6, name, plan: null, error: null });

      clearInterval(timers.current[profileId]);
      timers.current[profileId] = setInterval(() => {
        setUploads((u) => {
          const cur = u[profileId];
          if (!cur || cur.status !== "uploading") return u;
          // ramp suave até ~92% enquanto a requisição está em andamento
          const next = Math.min(92, cur.progress + Math.max(0.8, (92 - cur.progress) * 0.07));
          return { ...u, [profileId]: { ...cur, progress: next } };
        });
      }, 350);

      try {
        const dataUrl = await fileToDataURL(file);
        const res = await apiPost("/diet-plans/import", {
          patientProfileId: profileId,
          pdfBase64: dataUrl,
          title: `Plano de ${name}`,
        });
        clearInterval(timers.current[profileId]);
        patchUp(profileId, { status: "done", progress: 100, plan: res && res.plan });
        toast(`Plano de ${name.split(" ")[0]} importado! 🎉`, "success");
      } catch (e) {
        clearInterval(timers.current[profileId]);
        patchUp(profileId, { status: "error", error: (e && e.message) || "Falha ao importar o plano." });
        toast(`Não foi possível importar o plano de ${name.split(" ")[0]}.`, "error");
      }
    },
    [patchUp, toast]
  );

  return (
    <UploadCtx.Provider value={{ uploads, startImport, dismissUpload, toast }}>
      {children}
      <Toaster toasts={toasts} onClose={closeToast} />
    </UploadCtx.Provider>
  );
}
