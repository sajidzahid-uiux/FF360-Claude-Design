"use client";

interface TableStatusBadgeProps {
  title: string;
  color?: string;
}

export function TableStatusBadge({
  title,
  color = "#3b82f6",
}: TableStatusBadgeProps) {
  return (
    <span
      className="inline-flex max-w-full items-center rounded px-2 py-1 text-xs font-semibold whitespace-nowrap text-white"
      style={{ backgroundColor: color }}
      title={title}
    >
      <span className="truncate">{title}</span>
    </span>
  );
}
