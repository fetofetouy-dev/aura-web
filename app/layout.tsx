import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { GlobalAuthHandler } from "@/components/GlobalAuthHandler";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Aura - Automatización Inteligente para Pymes",
  description: "Liberamos tiempo y recursos con agentes de IA que trabajan 24/7 para tu negocio.",
  keywords: ["automatización", "IA", "Pymes", "Claude AI", "automatización de procesos"],
  openGraph: {
    title: "Aura - Automatización Inteligente para Pymes",
    description: "Liberamos tiempo y recursos con agentes de IA que trabajan 24/7 para tu negocio.",
    url: "https://aura.com",
    siteName: "Aura",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aura - Automatización Inteligente para Pymes",
    description: "Liberamos tiempo y recursos con agentes de IA que trabajan 24/7 para tu negocio.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <GoogleAnalytics />
        <GlobalAuthHandler />
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
