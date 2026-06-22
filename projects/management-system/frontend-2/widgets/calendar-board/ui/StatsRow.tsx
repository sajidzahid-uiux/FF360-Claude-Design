"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";

import type { CalendarStatsCounts } from "@/entities/calendar-item";

export interface StatsRowProps {
  counts: CalendarStatsCounts;
  onAddMissingSchedule?: () => void;
  className?: string;
}

export function StatsRow({
  counts,
  onAddMissingSchedule,
  className,
}: StatsRowProps) {
  return (
    <>
      <div
        className={cn(
          "bg-bg-app flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-2 md:hidden",
          className
        )}
      >
        <MobileLegend
          count={counts.leads}
          dotClass="bg-accent-orange-bright"
          label="Leads"
        />
        <MobileLegend
          count={counts.notStarted}
          dotClass="bg-accent-neutral-mid"
          label="Not Started"
        />
        <MobileLegend
          count={counts.inProgress}
          dotClass="bg-accent-blue-light"
          label="Active"
        />
        <MobileLegend
          count={counts.completed}
          dotClass="bg-accent-green-deep"
          label="Done"
        />
        <MobileLegend
          count={counts.overdue}
          dotClass="bg-feedback-error"
          label="Overdue"
        />
      </div>

      <div
        className={cn(
          "bg-bg-app hidden flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 md:flex",
          className
        )}
      >
        <div className="bg-accent-orange-soft flex h-[41px] items-center rounded-[8px] pr-1 pl-4 shadow-[0_0_2px_rgba(0,0,0,0.25)]">
          <span
            aria-hidden
            className="bg-accent-orange-bold h-[10px] w-[10px] shrink-0 rounded-full"
          />
          <span className="text-accent-orange-soft-foreground ml-2 text-[12px] leading-4">
            <span className="font-bold">{counts.missingSchedules}</span>
            <span className="font-normal"> Missing Schedules</span>
          </span>
          <Button
            aria-label="Add"
            className="ml-3"
            size={ComponentSizeEnum.SM}
            title="Add"
            variant={ButtonVariantEnum.SURFACE}
            onClick={onAddMissingSchedule}
          />
        </div>

        <div className="flex flex-wrap items-center gap-[8px]">
          <LegendPill
            count={counts.leads}
            dotClass="bg-accent-orange-bright"
            label="Leads"
            textClass="text-accent-orange-bright"
          />
          <LegendPill
            count={counts.notStarted}
            dotClass="bg-accent-neutral-mid"
            label="Not Started"
            textClass="text-accent-neutral-mid"
          />
          <LegendPill
            count={counts.inProgress}
            dotClass="bg-accent-blue-light"
            label="Jobs not done yet"
            textClass="text-accent-blue-bold"
          />
          <LegendPill
            count={counts.completed}
            dotClass="bg-accent-green-deep"
            label="Completed"
            textClass="text-accent-green-deep"
          />
          <LegendPill
            count={counts.overdue}
            dotClass="bg-feedback-error"
            label="Overdue"
            textClass="text-feedback-error"
          />
        </div>
      </div>
    </>
  );
}

interface LegendPillProps {
  count: number;
  label: string;
  dotClass: string;
  textClass: string;
}

function LegendPill({ count, label, dotClass, textClass }: LegendPillProps) {
  return (
    <span className="bg-bg-app inline-flex h-[41px] items-center rounded-[14px] px-4">
      <span
        aria-hidden
        className={cn("h-[10px] w-[10px] shrink-0 rounded-full", dotClass)}
      />
      <span
        className={cn(
          "ml-2 text-[12px] leading-4 whitespace-nowrap",
          textClass
        )}
      >
        <span className="font-bold">{count}</span>
        <span className="font-normal"> {label}</span>
      </span>
    </span>
  );
}

interface MobileLegendProps {
  count: number;
  label: string;
  dotClass: string;
}

function MobileLegend({ count, label, dotClass }: MobileLegendProps) {
  return (
    <span className="text-text-primary inline-flex items-center gap-1.5 text-[12px] leading-4">
      <span
        aria-hidden
        className={cn("h-2 w-2 shrink-0 rounded-full", dotClass)}
      />
      <span className="font-bold">{count}</span>
      <span className="font-normal">{label}</span>
    </span>
  );
}
