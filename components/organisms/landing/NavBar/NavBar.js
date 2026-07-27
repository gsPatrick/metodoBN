"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/atoms/Logo/Logo";
import Button from "@/components/atoms/landing/Button/Button";
import styles from "./NavBar.module.css";

const LINKS = [
  { label: "Sobre", href: "#sobre" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Planos", href: "#planos" },
  { label: "Depoimentos", href: "#depoimentos" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={styles.header}>
        <nav
          className={`${styles.pill} ${scrolled ? styles.pillScrolled : ""}`}
          aria-label="Principal"
        >
          <Link href="/nutricionista" className={styles.logo}>
            <Logo size="sm" showName />
          </Link>

          <ul className={styles.links}>
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={styles.link}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <Button label="Agendar consulta" href="#agendar" variant="glass" />

          <button
            type="button"
            className={styles.menuBtn}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </nav>
      </header>

      {open ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <ul className={styles.mobileLinks}>
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#agendar" onClick={() => setOpen(false)}>
                Agendar consulta
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </>
  );
}
