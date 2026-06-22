"use client";

import { type Job, JobType } from "@/api/types";
import type { CardProps } from "@/features/job-lead/model/cardProps";
import { useJobPermissions } from "@/hooks/permissions";
import { GenericCard } from "@/shared/ui/common";
import { getJobCardProps } from "@/shared/ui/common/GenericCard";

export function TilingCard({
  data,
  onShowMore,
  onTrash,
  onSelect,
  onDeselect,
  isSelected,
  onArchive,
  onUnarchive,
  onRowDoubleClick,
  onOnSiteTracking,
  onLogs,
  showJobStatus = false,
}: CardProps<Job> & {
  onOnSiteTracking?: (id: number) => void;
  onLogs?: (id: number, isArchived?: boolean) => void;
}) {
  const isArchived = showJobStatus;
  const { canEdit, canDelete } = useJobPermissions(JobType.TILING);

  const cardProps = getJobCardProps(
    data,
    {
      onShowMore,
      onTrash,
      onArchive,
      onUnarchive,
      onSelect,
      onDeselect,
      onRowDoubleClick,
      onOnSiteTracking,
      onLogs,
    },
    {
      jobType: JobType.TILING,
      isArchived,
      isSelected,
      canEdit,
      canDelete,
    }
  );

  return <GenericCard {...cardProps} />;
}
