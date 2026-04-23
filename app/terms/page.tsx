import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-20 animate-in">
      <Link href="/">
        <Button variant="ghost" className="mb-8 font-bold text-academic-navy/60 hover:text-academic-navy">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al portal
        </Button>
      </Link>
      
      <div className="rounded-[3rem] border border-academic-gold/10 bg-white p-10 shadow-premium md:p-16">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-academic-gold/10 text-academic-gold">
          <FileText className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-black tracking-tight text-academic-navy md:text-5xl">Términos y Condiciones</h1>
        <div className="mt-8 space-y-6 text-lg font-medium leading-relaxed text-academic-slate">
          <p>
            Al utilizar esta plataforma, usted acepta el uso responsable de las herramientas educativas provistas.
            El acceso es personal e intransferible.
          </p>
          <p>
            El contenido generado por los docentes es propiedad intelectual de la institución y está destinado 
            exclusivamente al progreso pedagógico de los alumnos registrados.
          </p>
          <p className="pt-4 text-xs font-black uppercase tracking-widest text-academic-gold">Versión 1.0.0 • 2025</p>
        </div>
      </div>
    </main>
  );
}
