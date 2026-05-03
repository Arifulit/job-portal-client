// এই ফাইলটি reusable UI primitive/component সরবরাহ করে।

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-800",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
        destructive:
          "border-error-200 bg-error-50 text-error-700 dark:border-error-800 dark:bg-error-900 dark:text-error-200 hover:bg-error-100 dark:hover:bg-error-800",
        outline: "border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300",
        success: "border-success-200 bg-success-50 text-success-700 dark:border-success-800 dark:bg-success-900 dark:text-success-200 hover:bg-success-100 dark:hover:bg-success-800",
        warning: "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-800 dark:bg-warning-900 dark:text-warning-200 hover:bg-warning-100 dark:hover:bg-warning-800",
        info: "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-900 dark:text-primary-200 hover:bg-primary-100 dark:hover:bg-primary-800",
        error: "border-error-200 bg-error-50 text-error-700 dark:border-error-800 dark:bg-error-900 dark:text-error-200 hover:bg-error-100 dark:hover:bg-error-800"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

export default Badge;
