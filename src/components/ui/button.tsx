import * as React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  default:
    "border border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[0_14px_30px_rgba(19,42,58,0.18)] hover:bg-[var(--accent-strong)] hover:shadow-[0_20px_36px_rgba(19,42,58,0.2)] active:translate-y-px",
  outline:
    "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] shadow-[0_10px_24px_rgba(34,46,56,0.08)] hover:border-[var(--accent)] hover:bg-[var(--surface-muted)] hover:shadow-[0_14px_28px_rgba(34,46,56,0.12)] active:translate-y-px",
};

const sizeClasses = {
  default: "h-11 px-4 py-2",
  sm: "h-9 rounded-xl px-3",
  lg: "h-12 rounded-2xl px-5",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
        "ring-offset-[var(--background)]",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
