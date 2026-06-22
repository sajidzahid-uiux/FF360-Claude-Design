"use client";

import { type ReactNode } from "react";

import { cn } from "@fieldflow360/org-ui";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { JobType, Status } from "@/api/types";
import { useMobileJobListRowExpanded } from "@/features/jobs/hooks/useMobileJobListRowExpanded";
import type { JobTableRow } from "@/features/jobs/lib/columns";
import type { MobileJobListRowModel } from "@/features/jobs/lib/getMobileJobListRowModel";
import { JobStatusCell } from "@/features/jobs/ui/JobStatusCell";
import { TouchSlideText } from "@/shared/ui/common/TouchSlideText";

const DETAIL_ROW_CLASS = "min-h-[1.25rem] text-xs leading-snug";
const TOUCH_SLIDE_MAX_WIDTH = "w-full min-w-0 max-w-full";

function MobileJobListTouchSlideValue({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={cn(DETAIL_ROW_CLASS, "min-w-0")}>
      <TouchSlideText
        className={className}
        maxWidth={TOUCH_SLIDE_MAX_WIDTH}
        text={text}
      />
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className={cn(DETAIL_ROW_CLASS, "text-text-muted font-medium")}>
      {children}
    </p>
  );
}

function ExpandToggle({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-expanded={expanded}
      aria-label={expanded ? "Collapse job details" : "Expand job details"}
      className="text-text-muted shrink-0 leading-none"
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      {expanded ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );
}

interface JobMobileListRowJobNumberCellProps {
  jobId: number;
  model: MobileJobListRowModel;
  actions?: ReactNode;
}

export function JobMobileListRowJobNumberCell({
  jobId,
  model,
  actions,
}: JobMobileListRowJobNumberCellProps) {
  const { expanded, toggle } = useMobileJobListRowExpanded(jobId);

  return (
    <div className="flex min-w-0 flex-col gap-2 py-1">
      <div className="flex min-w-0 items-start gap-1">
        <ExpandToggle expanded={expanded} onToggle={toggle} />
        <div className="min-w-0 flex-1">
          <MobileJobListTouchSlideValue
            className={cn(
              "text-sm font-semibold",
              model.onHoldHighlight && "text-yellow-500"
            )}
            text={model.identifier}
          />
        </div>
      </div>

      {expanded ? (
        <>
          <FieldLabel>Job Name</FieldLabel>
          <FieldLabel>Phone</FieldLabel>
          <FieldLabel>Status</FieldLabel>

          {model.expandedFields.map((field) => (
            <FieldLabel key={field.label}>{field.label}</FieldLabel>
          ))}

          {actions ? <div className="mt-1">{actions}</div> : null}
        </>
      ) : null}
    </div>
  );
}

interface JobMobileListRowLastUpdatedCellProps {
  jobId: number;
  model: MobileJobListRowModel;
  isArchived?: boolean;
  inlineStatus?: {
    job: JobTableRow;
    jobType: JobType;
    statusTypes: Status[];
  };
}

export function JobMobileListRowLastUpdatedCell({
  jobId,
  model,
  isArchived = false,
  inlineStatus,
}: JobMobileListRowLastUpdatedCellProps) {
  const { expanded } = useMobileJobListRowExpanded(jobId);

  return (
    <div className="flex min-w-0 flex-col gap-2 py-1">
      <MobileJobListTouchSlideValue
        className="text-text-muted text-sm font-semibold"
        text={model.lastUpdatedLine}
      />

      {expanded ? (
        <>
          <MobileJobListTouchSlideValue
            className={cn(model.onHoldHighlight && "text-yellow-500")}
            text={model.jobName}
          />

          <MobileJobListTouchSlideValue
            className="text-text-muted"
            text={model.phone}
          />

          <div className={DETAIL_ROW_CLASS}>
            {inlineStatus ? (
              <JobStatusCell
                isArchived={isArchived}
                job={inlineStatus.job}
                jobType={inlineStatus.jobType}
                statusTypes={inlineStatus.statusTypes}
              />
            ) : (
              <span
                className="inline-flex rounded px-2 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: model.statusColor }}
              >
                {model.statusLabel}
              </span>
            )}
          </div>

          {model.expandedFields.map((field) => (
            <MobileJobListTouchSlideValue
              key={field.label}
              className="text-text-muted"
              text={field.value}
            />
          ))}
        </>
      ) : null}
    </div>
  );
}
