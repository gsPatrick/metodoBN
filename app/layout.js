import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";
import UploadProvider from "@/components/providers/UploadProvider";

export const metadata = {
  title: "Nutri — Design System",
  description: "Sistema de design premium para plataforma de nutrição."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
        </ThemeProvider>
      </body>
    </html>
  );
}
