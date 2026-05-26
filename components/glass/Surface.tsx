import { type HTMLAttributes, type ElementType } from "react";

type SurfaceProps<T extends ElementType = "div"> = {
  as?: T;
  variant?: "default" | "strong";
  sheen?: boolean;
  edge?: boolean;
} & HTMLAttributes<HTMLElement>;

/**
 * Surface — the primitive mirror-glass container.
 * Apply variant="strong" for floating panels, default for inline cards.
 */
export function Surface({
  as,
  variant = "default",
  sheen = true,
  edge = true,
  className = "",
  children,
  ...rest
}: SurfaceProps) {
  const Tag = (as ?? "div") as ElementType;
  const classes = [
    variant === "strong" ? "glass-strong" : "glass",
    edge ? "glass-edge" : "",
    sheen ? "glass-sheen" : "",
    "relative",
    className
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
