"use client";

import { useEffect, useState } from "react";
import Wordmark from "@/components/lp/atoms/Wordmark/Wordmark";
import styles from "./Header.module.css";

const LINKS = [
  { label: "O Método", href: "#metodo" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

export default function Header() {
  // Cada seção declara em data-lp-nav com que cor o header deve aparecer sobre
  // ela, então seções novas não exigem mexer aqui.
  const [tone, setTone] = useState("onDark");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll("[data-lp-nav]");
    const onScroll = () => {
      const probe = window.scrollY + 56;
      let next = "onDark";
      sections.forEach((section) => {
        const top = section.offsetTop;
        if (probe >= top && probe < top + section.offsetHeight) {
          next = section.getAttribute("data-lp-nav") || "onDark";
        }
      });
      setTone(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onDark = tone === "onDark";

  return (
    <>
      <header className={`${styles.header} ${onDark ? styles.onDark : styles.onLight}`}>
        <a href="#topo" className={styles.brand} aria-label="Método BN — início">
          <Wordmark tone={tone} size="sm" />
        </a>

        <nav className={styles.pill} aria-label="Navegação principal">
          <ul className={styles.links}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a className={styles.link} href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a className={styles.cta} href="#contato">
            Agendar
          </a>
        </nav>

        <button
          type="button"
          className={styles.burger}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`${styles.burgerLine} ${open ? styles.burgerTop : ""}`} />
          <span className={`${styles.burgerLine} ${open ? styles.burgerBottom : ""}`} />
        </button>
      </header>

      <div
        className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
      >
        <ul className={styles.sheetMenu}>
          {LINKS.map((l) => (
            <li key={l.href}>
              <a className={styles.sheetItem} href={l.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a className={styles.sheetCta} href="#contato" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          Agendar consulta
        </a>
      </div>
    </>
  );
}
