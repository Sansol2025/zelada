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
  title: `${APP_NAME} | ${APP_SUBTITLE}`,
  description:
    "Plataforma educativa inclusiva para primaria con recorridos secuenciales, acceso sin barreras y seguimiento familiar."
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
