"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Copy, Link2, Printer } from "lucide-react";

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
    <Card className="flex flex-col sm:flex-row gap-4 p-3 md:p-3 max-w-sm overflow-hidden items-start">
      <div className="shrink-0 flex h-[110px] w-[110px] items-center justify-center rounded-lg border border-slate-100 bg-white p-1.5 shadow-sm">
        <Image src={qrDataUrl} alt={`QR de acceso para ${studentName}`} width={100} height={100} className="h-full w-full object-contain" />
      </div>
      <div className="flex-1 min-w-0 space-y-2 py-0.5">
        <div>
          <CardTitle className="text-sm font-bold text-academic-navy leading-tight">{studentName}</CardTitle>
          <CardText className="text-[10px] leading-tight text-slate-400 font-medium">
            Ingreso rápido por QR o enlace directo.
          </CardText>
        </div>
        
        <div className="w-full rounded bg-slate-50 border border-slate-100 p-1.5 overflow-hidden">
          <p className="text-[9px] font-mono text-slate-400 truncate">
            {accessUrl}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 gap-1 px-2 text-[9px] font-bold uppercase tracking-tight bg-academic-gold/10 text-academic-gold hover:bg-academic-gold hover:text-white border-none"
            onClick={async () => {
              await navigator.clipboard.writeText(accessUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "LISTO" : "COPIAR"}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-7 gap-1 px-2 text-[9px] font-bold uppercase tracking-tight text-academic-navy hover:bg-academic-ivory"
            onClick={() => window.print()}
          >
            <Printer className="h-3 w-3" />
            IMPRIMIR
          </Button>
          
          <a className="inline-flex" href={accessUrl} target="_blank" rel="noreferrer">
            <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[9px] font-bold uppercase tracking-tight text-slate-400 hover:text-academic-navy">
              <Link2 className="h-3 w-3" />
              ABRIR
            </Button>
          </a>
        </div>
        {expiresAt ? <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest">Expira: {new Date(expiresAt).toLocaleDateString()}</p> : null}
      </div>
    </Card>
  );
}
