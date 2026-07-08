"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/atoms/Icon/Icon";
import styles from "./InstallPrompt.module.css";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iphone|ipad|ipod/i.test(ua);
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    // registra o service worker (necessário p/ o prompt de instalação no Android)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    if (isStandalone()) return undefined; // já instalado → não mostra
    let dismissed = false;
    try {
      dismissed = localStorage.getItem("bn_install_dismissed") === "1";
    } catch {
      /* ignora */
    }
    if (dismissed) return undefined;

    function onBIP(e) {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    }
    window.addEventListener("beforeinstallprompt", onBIP);

    let timer = null;
    if (isIOS()) {
      // iOS (Safari) não dispara beforeinstallprompt → mostra a dica após um instante
      timer = window.setTimeout(() => setShow(true), 1800);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      if (timer) clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    setShow(false);
    setIosHelp(false);
    try {
      localStorage.setItem("bn_install_dismissed", "1");
    } catch {
      /* ignora */
    }
  }

  async function install() {
    if (deferred) {
      deferred.prompt();
      try {
        await deferred.userChoice;
      } catch {
        /* ignora */
      }
      setDeferred(null);
      setShow(false);
    } else if (isIOS()) {
      setIosHelp(true);
    }
  }

  if (!show) return null;

  return (
    <>
      <div className={styles.banner} role="dialog" aria-label="Instalar aplicativo">
        <img className={styles.icon} src="/publico.png" alt="" />
        <span className={styles.text}>
          <b className={styles.title}>Instalar o Método BN</b>
          <span className={styles.sub}>Mais rápido, em tela cheia, direto da tela inicial.</span>
        </span>
        <button type="button" className={styles.cta} onClick={install}>
          <Icon name="download" size={16} /> Instalar
        </button>
        <button type="button" className={styles.x} onClick={dismiss} aria-label="Agora não">
          <Icon name="close" size={16} />
        </button>
      </div>

      {iosHelp && (
        <div className={styles.sheetOverlay} onClick={() => setIosHelp(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <span className={styles.handle} />
            <img className={styles.sheetIcon} src="/publico.png" alt="" />
            <h3 className={styles.sheetTitle}>Instalar no iPhone</h3>
            <p className={styles.sheetSub}>É rapidinho — 3 passos no Safari:</p>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepNum}>1</span>
                Toque em <b>Compartilhar</b>
                <span className={styles.shareIco}>
                  <Icon name="upload" size={15} />
                </span>
                na barra de baixo.
              </li>
              <li>
                <span className={styles.stepNum}>2</span>
                Role e toque em <b>“Adicionar à Tela de Início”</b>.
              </li>
              <li>
                <span className={styles.stepNum}>3</span>
                Toque em <b>Adicionar</b> — pronto! 🎉
              </li>
            </ol>
            <button type="button" className={styles.gotIt} onClick={() => setIosHelp(false)}>
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
