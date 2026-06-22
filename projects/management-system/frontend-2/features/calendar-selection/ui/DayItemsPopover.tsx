"use client";

import { useEffect, useMemo, useRef } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { format } from "date-fns";
import { X } from "lucide-react";

import {
  type CalendarItem,
  ItemCard,
  sortByStartDate,
} from "@/entities/calendar-item";

export interface DayItemsPopoverProps {
  date: Date;
  items: CalendarItem[];
  onClose: () => void;
  onItemClick?: (item: CalendarItem) => void;
  className?: string;
}

export function DayItemsPopover({
  date,
  items,
  onClose,
  onItemClick,
  className,
}: DayItemsPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const sortedItems = useMemo(() => sortByStartDate(items), [items]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      onClick={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className={cn(
          "bg-bg-surface-elevated relative flex max-h-[80vh] w-full max-w-[360px] flex-col overflow-hidden rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)]",
          className
        )}
      >
        <div className="border-border-subtle flex items-center justify-between border-b px-4 py-3">
          <div className="flex flex-col">
            <span className="text-text-muted text-[10px] leading-none font-semibold tracking-[0.5px]">
              {format(date, "EEE").toUpperCase()}
            </span>
            <span className="text-text-primary mt-1 text-[16px] leading-none font-bold">
              {format(date, "d MMM yyyy")}
            </span>
          </div>
          <Button
            iconOnly
            aria-label="Close"
            leftIcon={<X aria-hidden className="h-4 w-4" />}
            size={ComponentSizeEnum.SM}
            variant={ButtonVariantEnum.GHOST}
            onClick={onClose}
          />
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto p-3">
          {sortedItems.length === 0 ? (
            <p className="text-text-muted py-2 text-center text-[12px]">
              No items.
            </p>
          ) : (
            sortedItems.map((item) => (
              <ItemCard
                key={item.id}
                className="border-border-subtle bg-bg-surface-elevated rounded-[10px] border"
                item={item}
                onClick={onItemClick}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
