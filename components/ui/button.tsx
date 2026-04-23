"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-academic-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-academic-navy text-white hover:bg-brand-950 shadow-sm",
        secondary: "bg-academic-gold text-white hover:bg-[#b08d4a] shadow-sm",
        outline: "bg-white text-academic-navy border border-academic-gold/30 hover:bg-academic-ivory",
        ghost: "text-academic-navy hover:bg-academic-ivory",
        success: "bg-academic-forest text-white hover:bg-[#23382f]",
        link: "text-academic-gold underline-offset-4 hover:underline p-0 h-auto"
      },
      size: {
        sm: "h-11 px-4 text-xs",
        md: "h-12 px-6 text-sm",
        lg: "h-14 px-8 text-base tracking-tight",
        xl: "h-16 px-10 text-lg font-bold tracking-tight"
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
