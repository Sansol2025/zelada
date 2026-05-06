"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type DeleteStudentButtonProps = {
  onDelete: (formData: FormData) => Promise<void>;
  studentId: string;
};

export function DeleteStudentButton({ onDelete, studentId }: DeleteStudentButtonProps) {
  const { pending } = useFormStatus();

  const handleClick = (e: React.MouseEvent) => {
    if (!confirm("¿Estás seguro de eliminar a este alumno?")) {
      e.preventDefault();
    }
  };

  return (
    <form action={onDelete}>
      <input type="hidden" name="student_id" value={studentId} />
      <button 
        type="submit"
        disabled={pending}
        onClick={handleClick}
        className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50" 
        title="Eliminar Alumno"
      >
        <Trash2 className={`h-4 w-4 ${pending ? 'animate-pulse' : ''}`} />
      </button>
    </form>
  );
}
