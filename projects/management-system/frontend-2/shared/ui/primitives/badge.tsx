import { ComponentProps } from "react";

import { cn } from "@fieldflow360/org-ui";
import { type VariantProps, cva } from "class-variance-authority";

import { Slot } from "./slot";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-border-strong focus-visible:ring-border-strong/50 focus-visible:ring-[3px] aria-invalid:ring-feedback-error/20 dark:aria-invalid:ring-feedback-error/40 aria-invalid:border-feedback-error transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-text-inverse [a&]:hover:bg-accent/90",
        secondary:
          "border-transparent bg-bg-surface text-text-secondary [a&]:hover:bg-bg-surface/90",
        destructive:
          "border-transparent bg-feedback-error text-white [a&]:hover:bg-feedback-error/90 focus-visible:ring-feedback-error/20 dark:focus-visible:ring-feedback-error/40 dark:bg-feedback-error/60",
        outline:
          "text-text-primary [a&]:hover:bg-bg-hover [a&]:hover:text-text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      {...props}
    />
  );
}

export { Badge, badgeVariants };
