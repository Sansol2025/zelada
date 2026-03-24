import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex rounded-full px-3 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-brand-100 text-brand-900",
      success: "bg-emerald-100 text-emerald-800",
      warning: "bg-amber-100 text-amber-800",
      danger: "bg-rose-100 text-rose-800"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
