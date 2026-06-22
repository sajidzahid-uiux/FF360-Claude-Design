import type { Status, TeamMember } from "@/api/types";
import { LeadType } from "@/constants/enums";
import { useRoutePermissions } from "@/hooks/permissions";
import { useInlineLeadStatusChange } from "@/hooks/useInlineLeadStatusChange";
import { GenericCard } from "@/shared/ui/common";
import {
  type LeadCardData,
  getLeadCardProps,
} from "@/shared/ui/common/GenericCard";

interface RepairLeadCardProps {
  data: LeadCardData;
  onShowMore: () => void;
  onLogs?: (id: number, isArchived?: boolean) => void;
  onTrash: (id: number) => void;
  onUnarchive: (id: number) => void;
  onArchive: (id: number) => void;
  onSelect: (id: number) => void;
  onDeselect: (id: number) => void;
  isSelected: boolean;
  onRowDoubleClick?: (id: number, isArchived: boolean) => void;
  showJobStatus?: boolean;
  leadTypes?: Status[];
  leadStatuses?: Status[];
  teamData?: TeamMember[];
}

export function RepairLeadCard({
  data,
  onShowMore,
  onLogs,
  onTrash,
  onUnarchive,
  onArchive,
  onSelect,
  onDeselect,
  isSelected,
  onRowDoubleClick,
  showJobStatus = false,
  leadTypes = [],
  leadStatuses = [],
  teamData = [],
}: RepairLeadCardProps) {
  const isArchived = showJobStatus; // Using showJobStatus as a proxy for isArchived
  const perms = useRoutePermissions();
  const readOnly = !perms?.write;
  const { handleInlineLeadStatusChange } = useInlineLeadStatusChange(
    LeadType.REPAIR
  );

  const cardProps = getLeadCardProps(
    data,
    {
      onShowMore,
      onLogs,
      onTrash,
      onArchive,
      onUnarchive,
      onSelect,
      onDeselect,
      onRowDoubleClick,
    },
    {
      isArchived,
      isSelected,
      readOnly,
      leadTypes,
      leadStatuses,
      teamData,
      onStatusChange: (statusId) => {
        void handleInlineLeadStatusChange(data.id, statusId);
      },
    }
  );

  return <GenericCard {...cardProps} />;
}
