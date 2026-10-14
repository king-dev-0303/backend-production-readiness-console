import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";
import { AlicerceProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/shell";

const corpo = Manrope({ variable: "--font-corpo", subsets: ["latin"] });
const titulo = Sora({ variable: "--font-titulo", subsets: ["latin"] });
const codigo = JetBrains_Mono({ variable: "--font-codigo", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alicerce - diagnóstico e produção da Jornada",
  description:
    "Console de diagnóstico e evolução do back-end da Jornada: achados de arquitetura e segurança, pipeline de deploy, PostgreSQL, storage, backups testados, APIs e publicação nas lojas.",
};

export const viewport: Viewport = { themeColor: "#34436a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${corpo.variable} ${titulo.variable} ${codigo.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AlicerceProvider>
          <TooltipProvider>
            <Shell>{children}</Shell>
            <Toaster position="bottom-right" theme="dark" richColors mobileOffset={{ bottom: "6rem" }} />
          </TooltipProvider>
        </AlicerceProvider>
      </body>
    </html>
  );
}
