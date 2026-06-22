"use client";

import { useMemo } from "react";

import {
  ComponentSizeEnum,
  TabsSwitcher,
  TabsSwitcherViewEnum,
  cn,
} from "@fieldflow360/org-ui";

import { JobLeadEntityType } from "@/constants";
import type { CalendarTabCounterValue } from "@/entities/calendar-item";

export interface TabCounterProps {
  leadCount: number;
  jobCount: number;
  active: CalendarTabCounterValue;
  onChange?: (value: CalendarTabCounterValue) => void;
  className?: string;
}

export function TabCounter({
  leadCount,
  jobCount,
  active,
  onChange,
  className,
}: TabCounterProps) {
  const items = useMemo(
    () => [
      {
        value: JobLeadEntityType.LEADS,
        label: `${leadCount} Leads`,
      },
      {
        value: JobLeadEntityType.JOBS,
        label: `${jobCount} Jobs`,
      },
    ],
    [jobCount, leadCount]
  );

  return (
    <TabsSwitcher
      className={cn(className)}
      items={items}
      size={ComponentSizeEnum.SM}
      value={active}
      view={TabsSwitcherViewEnum.PILL}
      onChange={(value) => onChange?.(value)}
    />
  );
}
