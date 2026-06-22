"use client";

import type { ReactNode } from "react";

import { cn } from "@fieldflow360/org-ui";

import { TouchSlideText } from "@/shared/ui/common";

import type { TableDateEmptyLabel } from "./tableDateFormat";
import { formatTableLocaleDate } from "./tableDateFormat";

export function TableLastUpdatedCell({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn("text-text-muted block truncate text-sm", className)}
      title={label}
    >
      {label}
    </span>
  );
}

export function TableLocaleDateCell({
  value,
  emptyLabel = "—",
  className,
  tabularNums = false,
}: {
  value: string | undefined | null;
  emptyLabel?: TableDateEmptyLabel;
  className?: string;
  tabularNums?: boolean;
}) {
  return (
    <span className={cn("text-sm", tabularNums && "tabular-nums", className)}>
      {formatTableLocaleDate(value, emptyLabel)}
    </span>
  );
}

export function TableTruncatedTextCell({
  text,
  className,
  emptyLabel = "—",
  muted = false,
  tabularNums = false,
  title,
}: {
  text: string | null | undefined;
  className?: string;
  emptyLabel?: string;
  muted?: boolean;
  tabularNums?: boolean;
  title?: string;
}) {
  const display = text?.trim() ? text : emptyLabel;

  return (
    <span
      className={cn(
        "block truncate",
        muted && "text-text-muted text-sm",
        tabularNums && "tabular-nums",
        className
      )}
      title={title ?? (display !== emptyLabel ? display : undefined)}
    >
      {display}
    </span>
  );
}

export function TableTouchSlideTextCell({
  text,
  className = "font-medium",
  maxWidth,
  onDoubleClick,
  emptyLabel = "—",
}: {
  text: string | null | undefined;
  className?: string;
  maxWidth: string;
  onDoubleClick?: () => void;
  emptyLabel?: string;
}) {
  const content = (
    <TouchSlideText
      className={className}
      maxWidth={maxWidth}
      text={text?.trim() ? text : emptyLabel}
    />
  );

  if (!onDoubleClick) return content;

  return <div onDoubleClick={onDoubleClick}>{content}</div>;
}

export function TablePhoneCell({
  phone,
  fallback = "N/A",
}: {
  phone: string | null | undefined;
  fallback?: string;
}) {
  const display = phone?.trim() ? phone : fallback;

  return (
    <span className="block truncate tabular-nums" title={display}>
      {display}
    </span>
  );
}

export function TableActionsColumnHeader({
  srOnlyLabel = "Actions",
}: {
  srOnlyLabel?: string;
}) {
  return <span className="sr-only">{srOnlyLabel}</span>;
}

export function tableActionsColumnShell<T extends { id: string | number }>({
  width = "80px",
  render,
}: {
  width?: string;
  render: (row: T) => ReactNode;
}): Pick<
  import("@fieldflow360/org-ui").Column<T>,
  "key" | "label" | "hideable" | "header" | "width" | "align" | "render"
> {
  return {
    key: "actions",
    label: "Actions",
    hideable: false,
    header: "",
    width,
    align: "right",
    render,
  };
}
