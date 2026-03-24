"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";

type QRAccessCardProps = {
  studentName: string;
  accessUrl: string;
  qrDataUrl: string;
  expiresAt?: string | null;
};

export function QRAccessCard({ studentName, accessUrl, qrDataUrl, expiresAt }: QRAccessCardProps) {
  const [copied, setCopied] = useState(false);

  return (
    <Card className="grid gap-4 lg:grid-cols-[170px,1fr]">
      <div className="mx-auto rounded-2xl border border-brand-100 bg-white p-2">
        <Image src={qrDataUrl} alt={`QR de acceso para ${studentName}`} width={150} height={150} />
      </div>
      <div className="space-y-3">
        <div>
          <CardTitle className="text-lg">{studentName}</CardTitle>
          <CardText>
            Ingreso rápido por QR o enlace único para abrir en celular, tablet o PC.
          </CardText>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-xs text-brand-700">{accessUrl}</div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={async () => {
              await navigator.clipboard.writeText(accessUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            Copiar enlace
          </Button>
          <a className="inline-flex" href={accessUrl} target="_blank" rel="noreferrer">
            <Button type="button" variant="ghost" size="sm" className="gap-2">
              <Link2 className="h-4 w-4" />
              Abrir enlace
            </Button>
          </a>
        </div>
        {expiresAt ? <p className="text-xs text-brand-600">Expira: {new Date(expiresAt).toLocaleString()}</p> : null}
      </div>
    </Card>
  );
}
