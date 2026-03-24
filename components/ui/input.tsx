import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-brand-200 bg-white px-4 text-sm text-brand-900 outline-none ring-brand-300 transition placeholder:text-brand-400 focus:ring-2",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
