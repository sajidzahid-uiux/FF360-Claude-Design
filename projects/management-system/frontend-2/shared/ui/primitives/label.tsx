import { ComponentProps } from "react";

import { cn } from "@fieldflow360/org-ui";
import { type VariantProps, cva } from "class-variance-authority";

export const labelVariants = cva(
  "select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
  {
    variants: {
      variant: {
        default: "flex items-center gap-2 text-sm leading-none font-medium",
        field: "text-sm font-medium",
        caption: "text-text-muted text-xs",
        muted: "text-text-muted text-sm font-medium",
        detailRow: "text-text-muted w-32 shrink-0 text-sm font-medium",
        detailBlock: "text-text-muted mb-2 block text-sm font-medium",
        inputBlock: "mb-2 block",
        section: "text-xl font-semibold",
        sectionCompact: "mb-2 block text-xl font-semibold",
        sectionBlock: "mb-4 block text-xl font-semibold",
        lg: "text-base font-medium",
        subheading: "text-base font-semibold",
        heading: "text-lg font-semibold",
        blockLg: "mb-2 block text-base font-medium",
        form: "text-text-primary text-[20px] leading-none font-semibold",
        formMedium: "text-[20px] leading-normal font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Label({
  className,
  variant,
  ...props
}: ComponentProps<"label"> & VariantProps<typeof labelVariants>) {
  return (
    <label
      className={cn(labelVariants({ variant }), className)}
      data-slot="label"
      {...props}
    />
  );
}

export { Label };
