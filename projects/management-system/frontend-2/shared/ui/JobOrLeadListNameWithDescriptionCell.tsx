"use client";

import {
  type JobOrLeadStakeholderSubtitleInput,
  type JobOrLeadTitleInput,
  type JobOrLeadTypeLabel,
  getJobOrLeadListName,
} from "@/shared/lib";

import { ExpandableDescriptionCell } from "./table-layout/ExpandableDescriptionCell";

export type JobOrLeadListNameRow = JobOrLeadTitleInput &
  JobOrLeadStakeholderSubtitleInput;

interface JobOrLeadListNameWithDescriptionCellProps {
  row: JobOrLeadListNameRow;
  typeLabel: JobOrLeadTypeLabel;
  highlightClassName?: string;
}

/** List-view name cell: primary contact/farm title with optional description below. */
export function JobOrLeadListNameWithDescriptionCell({
  row,
  typeLabel,
  highlightClassName = "",
}: JobOrLeadListNameWithDescriptionCellProps) {
  const description = row.description?.trim() || undefined;

  return (
    <ExpandableDescriptionCell
      description={description}
      descriptionClassName={highlightClassName}
      title={getJobOrLeadListName(row, typeLabel)}
      titleClassName={highlightClassName}
    />
  );
}
