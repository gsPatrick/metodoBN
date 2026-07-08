"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/atoms/Logo/Logo";
import { isLoggedIn, getCurrentUser } from "@/lib/api";
import styles from "./page.module.css";

// Porta de entrada do app: decide o destino (login ou home conforme o papel)
// e mostra um splash enquanto redireciona. É a tela inicial do PWA.
export default function RootGate() {
  const router = useRouter();

  useEffect(() => {
    let dest = "/login";
    try {
      if (isLoggedIn()) {
        const u = getCurrentUser();
        dest = u && u.role === "patient" ? "/app" : "/dashboard";
      }
    } catch {
      /* sem sessão → login */
    }
    router.replace(dest);
  }, [router]);

  return (
    <div className={styles.splash} data-theme="dark">
      <Logo size="lg" showName />
    </div>
  );
}
