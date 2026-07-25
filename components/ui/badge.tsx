import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string;
}

/** Badge simple. Si se pasa `color`, tiñe el fondo de forma suave. */
export function Badge({ className, color, style, children, ...props }: BadgeProps) {
  const colorStyle = color
    ? { backgroundColor: `${color}1a`, color, ...style }
    : style;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        !color && "bg-secondary text-secondary-foreground",
        className
      )}
      style={colorStyle}
      {...props}
    >
      {children}
    </span>
  );
}
