"use client";

import { cn } from "@fieldflow360/org-ui";
import { type VariantProps, cva } from "class-variance-authority";
import { ArrowLeftRight } from "lucide-react";

import { STATUS_BG_CLASS } from "../model/status";
import type { CalendarBarStatus } from "../model/types";

const chipVariants = cva(
  "flex h-[26px] w-full items-center gap-1 overflow-hidden rounded-[4px] px-1.5 text-[10px] leading-none font-medium text-white",
  {
    variants: {
      interactive: {
        true: "cursor-pointer transition-opacity hover:opacity-90",
        false: "",
      },
    },
    defaultVariants: { interactive: false },
  }
);

type Variants = VariantProps<typeof chipVariants>;

export interface StatusChipProps extends Omit<Variants, "interactive"> {
  title: string;
  status: CalendarBarStatus;
  showArrow?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Status-tinted event chip used inside grid day cells. Renders a button when
 * `onClick` is provided so keyboard activation works; otherwise renders a
 * plain div so the chip stays in the tab order naturally.
 */
export function StatusChip({
  title,
  status,
  showArrow = false,
  onClick,
  className,
}: StatusChipProps) {
  const interactive = Boolean(onClick);
  const composedClassName = cn(
    chipVariants({ interactive }),
    STATUS_BG_CLASS[status],
    className
  );

  const content = (
    <>
      {showArrow ? (
        <ArrowLeftRight
          aria-hidden
          className="h-2.5 w-2.5 shrink-0"
          strokeWidth={2.5}
        />
      ) : null}
      <span className="truncate">{title}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        className={composedClassName}
        title={title}
        type="button"
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={composedClassName} title={title}>
      {content}
    </div>
  );
}
