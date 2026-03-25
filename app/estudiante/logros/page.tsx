import { Award, Smile, Sparkles, Trophy, Star, PartyPopper } from "lucide-react";

import { StudentShell } from "@/components/layout/student-shell";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { getStudentContextOrRedirect } from "@/features/student/access";
import { getStudentAssignedSubjects, getStudentGlobalProgress } from "@/features/student/queries";
import { cn } from "@/lib/utils";

export default async function StudentAchievementsPage() {
  const student = await getStudentContextOrRedirect();
  const [assigned, global] = await Promise.all([
    getStudentAssignedSubjects(student.studentId),
    getStudentGlobalProgress(student.studentId)
  ]);

  const inProgress = (assigned ?? []).filter((entry) => entry.progress?.status === "in_progress").length;
  const completed = global.completedSubjects;

  return (
    <StudentShell
      title="Mis Grandes Logros"
      description="Cada medalla cuenta una historia de esfuerzo y aprendizaje. ¡Sigue adelante!"
      currentPath="/estudiante/logros"
    >
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-[2.5rem] shadow-xl text-white">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white opacity-20 blur-2xl" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/20 shadow-inner">
               <Trophy className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black">{completed}</p>
              <h3 className="text-lg font-bold uppercase tracking-widest text-amber-100">Materias Ganadas</h3>
            </div>
            <p className="text-sm font-medium text-amber-50">¡Has conquistado {completed} mundos! Eres increíble.</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-400 to-teal-500 p-8 rounded-[2.5rem] shadow-xl text-white">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white opacity-20 blur-2xl" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/20 shadow-inner">
               <Award className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black">{inProgress}</p>
              <h3 className="text-lg font-bold uppercase tracking-widest text-emerald-100">En Camino</h3>
            </div>
            <p className="text-sm font-medium text-emerald-50">Tienes {inProgress} aventuras activas. ¡No te detengas!</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-none bg-gradient-to-br from-rose-400 to-pink-500 p-8 rounded-[2.5rem] shadow-xl text-white lg:col-span-1 md:col-span-2">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white opacity-20 blur-2xl" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/20 shadow-inner">
               <Smile className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black uppercase tracking-tighter">¡Sigue Así!</p>
              <h3 className="text-lg font-bold uppercase tracking-widest text-rose-100">Mensaje Mágico</h3>
            </div>
            <p className="text-sm font-medium text-rose-50">Tu constancia es tu mejor superpoder.</p>
          </div>
        </Card>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="font-display text-2xl font-black text-brand-950 flex items-center gap-2">
          <Star className="h-6 w-6 text-brand-500 fill-brand-500" />
          Tus Medallas de Honor
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {(assigned ?? []).filter(e => e.progress?.status === "completed").length === 0 ? (
            <div className="col-span-full py-12 text-center rounded-[2.5rem] border-4 border-dashed border-brand-100 bg-brand-50/50">
               <PartyPopper className="h-12 w-12 text-brand-300 mx-auto mb-4" />
               <p className="text-xl font-bold text-brand-700">¡Completa tu primera materia para ganar una medalla!</p>
            </div>
          ) : (
            (assigned ?? []).filter(e => e.progress?.status === "completed").map((entry) => {
              const subject = Array.isArray(entry.subject) ? entry.subject[0] : entry.subject;
              if (!subject) return null;
              return (
                <div key={subject.id} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white border-4 border-emerald-100 shadow-sm transition-transform hover:-translate-y-1">
                   <div 
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-4 ring-emerald-50"
                    style={{ backgroundColor: subject.color || "#10b981" }}
                   >
                     <Star className="h-8 w-8 text-white fill-white" />
                   </div>
                   <div className="space-y-1">
                     <h4 className="text-xl font-black text-brand-950">{subject.title}</h4>
                     <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                       <CheckCircle2 className="h-3 w-3" /> Aventura Completada
                     </p>
                   </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </StudentShell>
  );
}

