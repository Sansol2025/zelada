"use client";
import { createPortal } from "react-dom";
import { APP_NAME, SCHOOL_NAME } from "@/lib/constants";

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
  const [isPrinting, setIsPrinting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [logoLoaded, setLogoLoaded] = useState(false);

  return (
    <>
      {/* VISTA DE PANTALLA (EXISTENTE) */}
      <Card className="flex flex-col sm:flex-row gap-4 p-3 md:p-3 max-w-sm overflow-hidden items-start no-print">
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
              onClick={() => {
                setIsPrinting(true);
                // Dar tiempo a que el portal se monte
                setTimeout(() => {
                  window.print();
                  setIsPrinting(false);
                }, 500); // Aumentar timeout por el peso del logo (3.7MB)
              }}
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

      {/* VISTA DE IMPRESIÓN (A4) - Renderizada en el body para evitar problemas de layout */}
      {isPrinting && typeof document !== "undefined" && createPortal(
        <div className="print-page font-sans text-academic-navy">
          <div className="flex flex-col items-center justify-center h-full border-[6px] border-double border-academic-gold/20 p-8 text-center box-border">
            {/* Logo de la escuela */}
            <div className="mb-4 h-24 w-24 relative">
              <Image 
                src="/logo.png" 
                alt="Logo Escuela" 
                fill
                priority
                className="object-contain"
                onLoad={() => setLogoLoaded(true)}
              />
            </div>
            
            <h1 className="text-3xl font-black mb-1 uppercase tracking-tighter text-academic-navy leading-tight">
              {SCHOOL_NAME.split("–")[0]}
            </h1>
            <p className="text-lg font-bold text-academic-gold mb-8 uppercase tracking-widest">
              {APP_NAME}
            </p>

            <div className="bg-white p-6 rounded-2xl border-[2px] border-academic-navy/10 shadow-lg mb-8">
              <Image src={qrDataUrl} alt="Código QR" width={300} height={300} className="w-[240px] h-[240px]" />
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-black text-academic-navy uppercase tracking-tighter">
                {studentName}
              </h2>
              <p className="text-lg font-medium text-slate-500 max-w-sm mx-auto italic leading-tight">
                Escanea el código para ingresar directamente a tu aventura.
              </p>
            </div>

            <div className="mt-auto pt-10 border-t border-slate-100 w-full flex justify-between items-end">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Plataforma Educativa</p>
                <p className="text-sm font-bold text-slate-400">zelada.vercel.app</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Fecha de Impresión</p>
                <p className="text-sm font-bold text-slate-400">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
