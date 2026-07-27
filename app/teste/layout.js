import "../nutricionista/landing.css";

export const metadata = {
  title: "Teste — Método BN",
  description: "Página de teste — construção seção por seção.",
};

export default function TesteLayout({ children }) {
  return (
    <div data-landing data-theme="dark">
      {children}
    </div>
  );
}
