import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";

import { AccessibilityProvider } from "@/components/providers/accessibility-provider";
import { APP_NAME, APP_SUBTITLE } from "@/lib/constants";

import "./globals.css";

const fontDisplay = Baloo_2({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"]
});

const fontBody = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | ${APP_SUBTITLE}`,
    template: `%s | ${APP_NAME}`
  },
  description: "Plataforma educativa inclusiva para primaria desarrollada para la Escuela N° 361. Recorridos secuenciales, acceso sin barreras y seguimiento familiar.",
  keywords: ["educación inclusiva", "escuela zelada", "aprendizaje adaptativo", "primaria", "la rioja"],
  authors: [{ name: "Aprender Sin Barreras" }],
  openGraph: {
    title: APP_NAME,
    description: APP_SUBTITLE,
    url: "https://aprender-sin-barreras.vercel.app",
    siteName: APP_NAME,
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_SUBTITLE,
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${fontDisplay.variable} ${fontBody.variable}`}>
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </body>
    </html>
  );
}
