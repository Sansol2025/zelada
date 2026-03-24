"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-500 text-white hover:bg-brand-600",
        secondary: "bg-white text-brand-900 border border-brand-200 hover:bg-brand-50",
        ghost: "text-brand-900 hover:bg-brand-50",
        success: "bg-emerald-500 text-white hover:bg-emerald-600"
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-14 px-7 text-base",
        xl: "h-16 px-8 text-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
