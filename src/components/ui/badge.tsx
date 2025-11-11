
import React from "react";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  secondary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  outline: "border border-gray-200 text-gray-800 dark:border-gray-700 dark:text-gray-100",
};

const Badge: React.FC<BadgeProps> = ({ variant = "default", className = "", children, ...props }) => {
  const classes = `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`.trim();
  return (
    <span {...props} className={classes}>
      {children}
    </span>
  );
};

export default Badge;
