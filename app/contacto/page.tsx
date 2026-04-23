import { ArrowLeft, Mail, Phone, School } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SCHOOL_NAME } from "@/lib/constants";

export default function ContactoPage() {
  return (
    <main className="min-h-screen relative overflow-hidden py-12 md:py-20 px-4 bg-academic-ivory">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-[45vh] bg-academic-navy rounded-b-[4rem] shadow-2xl">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-academic-gold/30 blur-3xl"></div>
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-academic-gold/10 blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-3xl relative z-10 flex flex-col justify-center animate-in">
      <Link href="/">
        <Button variant="ghost" className="mb-8 font-bold text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al portal
        </Button>
      </Link>
      
      <div className="rounded-[3rem] border border-academic-gold/10 bg-white p-10 shadow-premium md:p-16">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-academic-navy text-white shadow-lg">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-black tracking-tight text-academic-navy md:text-5xl">Soporte Técnico</h1>
        <p className="mt-4 text-xl font-medium text-academic-slate">¿Necesitas ayuda con tu acceso o el de tu hijo?</p>
        
        <div className="mt-12 grid gap-6">
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-academic-ivory border border-academic-gold/10">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Phone className="h-6 w-6 text-academic-gold" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-academic-gold">Teléfono Institucional</p>
              <p className="text-xl font-bold text-academic-navy">+54 380 444-1234</p>
            </div>
          </div>

          <div className="flex items-center gap-6 p-6 rounded-2xl bg-academic-ivory border border-academic-gold/10">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <School className="h-6 w-6 text-academic-gold" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-academic-gold">Presencial</p>
              <p className="text-xl font-bold text-academic-navy">{SCHOOL_NAME}</p>
              <p className="text-sm font-medium text-academic-slate">Barrio Zelada Davila, La Rioja</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
