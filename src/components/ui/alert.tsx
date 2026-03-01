import * as React from "react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

export function Alert({ className, variant = "default", ...props }: AlertProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm shadow-[0_10px_24px_rgba(25,36,46,0.08)]",
        variant === "default" &&
          "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]",
        variant === "destructive" &&
          "border-[var(--destructive-border)] bg-[var(--destructive-bg)] text-[var(--destructive-foreground)]",
        className,
      )}
      role="alert"
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return <h2 className={cn("font-medium tracking-[-0.01em]", className)} {...props} />;
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.JSX.Element {
  return <p className={cn("mt-1 text-sm leading-6 opacity-90", className)} {...props} />;
}
