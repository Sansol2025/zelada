import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 outline-none ring-brand-300 transition placeholder:text-brand-400 focus:ring-2",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
