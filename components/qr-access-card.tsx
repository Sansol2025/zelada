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
    <Card className="grid gap-4 sm:grid-cols-[130px,1fr] p-4 md:p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="mx-auto flex h-[130px] w-[130px] items-center justify-center rounded-lg border border-slate-100 bg-white p-2 shadow-inner">
        <Image src={qrDataUrl} alt={`QR de acceso para ${studentName}`} width={120} height={120} className="h-full w-full object-contain" />
      </div>
      <div className="flex flex-col justify-between space-y-2">
        <div>
          <CardTitle className="text-base font-bold text-academic-navy leading-tight mb-1">{studentName}</CardTitle>
          <CardText className="text-[10px] leading-tight text-slate-500 font-medium">
            Ingreso rápido por QR o enlace único para abrir en cualquier dispositivo.
          </CardText>
        </div>
        
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-[10px] font-mono text-slate-400 truncate">
          {accessUrl}
        </div>
        
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5 px-3 text-[10px] font-bold uppercase tracking-wider bg-academic-gold/10 text-academic-gold hover:bg-academic-gold hover:text-white transition-all border-none"
            onClick={async () => {
              await navigator.clipboard.writeText(accessUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-academic-navy hover:bg-academic-ivory transition-all"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir
          </Button>
          
          <a className="inline-flex" href={accessUrl} target="_blank" rel="noreferrer">
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-academic-navy transition-all">
              <Link2 className="h-3.5 w-3.5" />
              Abrir
            </Button>
          </a>
        </div>
        {expiresAt ? <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest pt-1">Expira: {new Date(expiresAt).toLocaleDateString()}</p> : null}
      </div>
    </Card>
  );
}
