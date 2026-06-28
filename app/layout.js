import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";
import UploadProvider from "@/components/providers/UploadProvider";
import InstallPrompt from "@/components/organisms/InstallPrompt/InstallPrompt";

export const metadata = {
  title: "Método: BN — Nutrição",
  description: "Acompanhamento nutricional com a Nutricionista Beatriz Nascimento.",
  manifest: "/manifest.webmanifest",
  applicationName: "Método BN",
  appleWebApp: {
    capable: true,
    title: "Método BN",
    statusBarStyle: "black"
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // usa a tela toda (notch/safe-area) — cara de app nativo
  interactiveWidget: "resizes-content", // teclado redimensiona o conteúdo (não sobrepõe)
  themeColor: "#0e0f12"
};

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('bn_theme');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <UploadProvider>{children}</UploadProvider>
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
