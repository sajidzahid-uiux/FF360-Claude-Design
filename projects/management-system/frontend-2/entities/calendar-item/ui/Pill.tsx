import { type ComponentProps } from "react";

import { cn } from "@fieldflow360/org-ui";
import { type VariantProps, cva } from "class-variance-authority";

import type { CalendarItemKind, CalendarWorkflowTone } from "../model/types";

const pillVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-medium leading-none whitespace-nowrap",
  {
    variants: {
      size: {
        xs: "h-[15px] overflow-hidden rounded-[6px] px-1.5 text-[7px]",
        sm: "h-[22px] rounded-[6px] px-2.5 text-[11px]",
        md: "h-[25px] rounded-md px-3 text-[13px]",
        pill: "h-6 rounded-full px-2.5 text-[11px]",
      },
      tone: {
        blue: "bg-accent-blue-light text-white",
        "blue-dark": "bg-accent-blue-bright text-white",
        amber: "bg-accent-orange-bright text-white",
        "amber-dark": "bg-accent-orange-bold text-white",
        green: "bg-accent-green-deep text-white",
        job: "bg-black text-white",
        lead: "bg-foreground/85 text-background",
        outlined:
          "border border-border-subtle bg-transparent text-text-primary",
      },
    },
    defaultVariants: { size: "md" },
  }
);

export type PillTone = CalendarWorkflowTone | CalendarItemKind | "outlined";

type Variants = VariantProps<typeof pillVariants>;

export interface PillProps
  extends Omit<ComponentProps<"span">, "color">, Omit<Variants, "tone"> {
  tone: PillTone;
  colorOverride?: string;
}

export function Pill({
  className,
  size,
  tone,
  colorOverride,
  style,
  ...props
}: PillProps) {
  const mergedStyle = colorOverride
    ? { ...style, backgroundColor: colorOverride }
    : style;
  return (
    <span
      className={cn(pillVariants({ size, tone }), className)}
      style={mergedStyle}
      {...props}
    />
  );
}
