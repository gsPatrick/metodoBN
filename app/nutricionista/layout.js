import "./landing.css";

export const metadata = {
  title: "Beatriz Nascimento — Método BN",
  description:
    "Nutrição clínica com acompanhamento contínuo. Pequenas escolhas, grandes transformações.",
  openGraph: {
    title: "Beatriz Nascimento — Método BN",
    description: "Pequenas escolhas, grandes transformações.",
    images: [{ url: "/login.jpg" }],
  },
};

export default function NutricionistaLayout({ children }) {
  return (
    <div data-landing data-theme="dark">
      {children}
    </div>
  );
}
