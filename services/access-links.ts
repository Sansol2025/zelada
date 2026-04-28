import crypto from "node:crypto";

import QRCode from "qrcode";

export function generateAccessToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function buildAccessUrl(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) || 
                  "https://zelada.vercel.app";
  return `${baseUrl.replace(/\/$/, "")}/ingreso/${token}`;
}

export async function buildQRCodeDataUrl(url: string) {
  return QRCode.toDataURL(url, {
    width: 360,
    margin: 1,
    color: {
      dark: "#1f4560",
      light: "#FFFFFF"
    }
  });
}
