/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

type ChildElement = React.ReactElement<any>;

export const DropdownMenu: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="relative inline-block">{children}</div>;
};

export const DropdownMenuTrigger: React.FC<{
  asChild?: boolean;
  children: ChildElement;
}> = ({ asChild, children }) => {
  if (asChild) {
    return React.cloneElement(children, {});
  }
  return (
    <button type="button" className="inline-flex items-center">
      {children}
    </button>
  );
};

export const DropdownMenuContent: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }
> = ({ align = "start", className = "", children, ...rest }) => {
  const alignClass = align === "end" ? "right-0" : "left-0";
  return (
    <div
      role="menu"
      className={`absolute z-50 mt-2 ${alignClass} rounded-md border bg-white dark:bg-gray-800 shadow ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<
  React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean; onClick?: () => void; children?: React.ReactNode }
> = ({ asChild, children, onClick, className = "", ...rest }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as ChildElement, { ...rest });
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export const DropdownMenuLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...rest }) => {
  return (
    <div className={`px-3 py-2 text-xs text-muted-foreground ${className}`} {...rest}>
      {children}
    </div>
  );
};

export const DropdownMenuSeparator: React.FC = () => {
  return <div className="my-1 w-full h-px bg-border" role="separator" />;
};