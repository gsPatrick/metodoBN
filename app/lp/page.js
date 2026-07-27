import { Inter, Roboto_Mono } from "next/font/google";
import styles from "./page.module.css";

import Header from "@/components/lp/organisms/Header/Header";
import Hero from "@/components/lp/organisms/Hero/Hero";
import Pergunta from "@/components/lp/organisms/Pergunta/Pergunta";
import Metodo from "@/components/lp/organisms/Metodo/Metodo";
import Sobre from "@/components/lp/organisms/Sobre/Sobre";
import Faq from "@/components/lp/organisms/Faq/Faq";
import Contato from "@/components/lp/organisms/Contato/Contato";
import Agenda from "@/components/lp/organisms/Agenda/Agenda";
import Aplicativo from "@/components/lp/organisms/Aplicativo/Aplicativo";
import Frase from "@/components/lp/organisms/Frase/Frase";
import Compras from "@/components/lp/organisms/Compras/Compras";
import Rodape from "@/components/lp/organisms/Rodape/Rodape";

// Par do arquétipo Darkroom: sans geométrica (pesos finos carregam os títulos
// grandes) + mono só para labels. Duas fontes, o teto da skill. next/font baixa
// no build e serve local — sem request ao Google em runtime.
const body = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  display: "swap",
  variable: "--font-lp-body",
});

const mono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-lp-mono",
});

export const metadata = {
  title: "Beatriz Nascimento — Nutricionista | Método BN",
  description:
    "Nutrição clínica sem dietas restritivas. Um plano construído para a sua rotina, com acompanhamento de perto. Presencial ou online.",
};

export default function LandingPage() {
  return (
    <div className={`${styles.page} ${body.variable} ${mono.variable}`} data-theme="dark">
      <Header />
      <main>
        <Hero />

        <Pergunta id="pergunta-metodo" inicio="O que é o" destaque="Método BN?" tom="claro" />
        <Metodo />

        <Pergunta id="pergunta-sobre" inicio="Quem está por trás do" destaque="Método BN?" tom="escuro" />
        <Sobre />

        <Faq />
        <Contato />
        <Agenda />
        <Aplicativo />

        <Frase id="frase-caderno" inicio="Do caderninho de anotações" destaque="para a palma da sua mão." tom="claro" />
        <Compras />
      </main>

      <Rodape />
    </div>
  );
}
