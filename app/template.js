"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./template.module.css";
import Fruit from "@/components/atoms/Fruit/Fruit";

/* template.js re-monta a cada navegação → a transição toca a cada troca de página */

const SKIP_TRANSITION_PREFIXES = ["/nutricionista", "/teste"];

const FRUITS = [
  { name: "banana", fallback: "banana" },
  { name: "maca", fallback: "apple" },
  { name: "laranja", fallback: "orange" }
];

function pickFruit(path) {
  const p = path || "/";
  let h = 0;
  for (let i = 0; i < p.length; i += 1) h = (h * 31 + p.charCodeAt(i)) | 0;
  return FRUITS[Math.abs(h) % FRUITS.length];
}

function effectiveTheme(pathname) {
  try {
    if (pathname.startsWith("/app")) return localStorage.getItem("bn_app_theme") === "light" ? "light" : "dark";
    if (pathname === "/" || pathname === "/login") return "dark";
    const t = document.documentElement.getAttribute("data-theme") || localStorage.getItem("bn_theme");
    return t === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export default function Template({ children }) {
  const pathname = usePathname();
  const skipTransition = SKIP_TRANSITION_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const [show, setShow] = useState(!skipTransition);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    setTheme(effectiveTheme(pathname));
    if (skipTransition) {
      setShow(false);
      return undefined;
    }
    setShow(true);
    const t = setTimeout(() => setShow(false), 1450);
    return () => clearTimeout(t);
  }, [pathname, skipTransition]);

  const fruit = pickFruit(pathname);

  if (skipTransition) {
    return <div className={styles.page}>{children}</div>;
  }

  return (
    <>
      {show && (
        <div className={styles.overlay} data-theme={theme} aria-hidden="true">
          <span className={styles.ring} />
          <span className={styles.fruit}>
            <Fruit name={fruit.name} fallback={fruit.fallback} size={172} />
          </span>
        </div>
      )}
      <div className={styles.page}>{children}</div>
    </>
  );
}
