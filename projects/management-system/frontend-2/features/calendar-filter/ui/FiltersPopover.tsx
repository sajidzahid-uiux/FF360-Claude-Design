"use client";

import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
} from "react";

import { Modal, cn } from "@fieldflow360/org-ui";

import type {
  CalendarDynamicFilterOptions,
  CalendarFilterKey,
  CalendarFiltersState,
} from "../model/types";
import { CalendarFiltersPanel } from "./CalendarFiltersPanel";

export interface FiltersPopoverProps {
  trigger: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CalendarFiltersState;
  onFilterChange: (key: CalendarFilterKey, values: string[]) => void;
  dynamicOptions?: CalendarDynamicFilterOptions;
  className?: string;
}

function attachOpenTrigger(trigger: ReactNode, onOpen: () => void): ReactNode {
  if (!isValidElement(trigger)) {
    return trigger;
  }

  const element = trigger as ReactElement<{
    onClick?: (event: React.MouseEvent) => void;
  }>;

  return cloneElement(element, {
    onClick: (event: React.MouseEvent) => {
      element.props.onClick?.(event);
      if (!event.defaultPrevented) {
        onOpen();
      }
    },
  });
}

export function FiltersPopover({
  trigger,
  open,
  onOpenChange,
  filters,
  onFilterChange,
  dynamicOptions,
  className,
}: FiltersPopoverProps) {
  return (
    <>
      {attachOpenTrigger(trigger, () => onOpenChange(true))}
      <Modal
        className={cn("max-w-[280px]", className)}
        isOpen={open}
        size="sm"
        title="Filters"
        onClose={() => onOpenChange(false)}
      >
        <CalendarFiltersPanel
          dynamicOptions={dynamicOptions}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      </Modal>
    </>
  );
}
