import { useMemo } from "react";

import { Dropdown } from "@/shared/ui/common";
import { buildRowActions } from "@/utils/actions";

export function ShowMoreExtraActionsDropdown({
  onDelete,
  onArchive,
  onHoldResume,
  onCancel,
  onLogs,
  isArchived,
  isOnHold,
  deleteLabel = "trash",
}: {
  onDelete?: () => void;
  onArchive?: () => void;
  onHoldResume?: () => void;
  onCancel?: () => void;
  onLogs?: () => void;
  isArchived?: boolean;
  isOnHold?: boolean;
  deleteLabel?: "trash" | "delete";
}) {
  const items = useMemo(() => {
    return buildRowActions({
      canView: false,
      canEdit: false,
      canDelete: !!onDelete,
      canArchive: !!onArchive,
      canTrack: false,
      isArchived: !!isArchived,
      onHold: isOnHold,

      onView: () => {},
      ...(onLogs && { onLogs }),
      ...(onDelete &&
        (deleteLabel === "delete"
          ? { onDelete: onDelete }
          : { onTrash: onDelete })),
      ...(onArchive && { onArchive, onUnarchive: onArchive }),
      ...(onHoldResume && { onHoldResume }),
      ...(onCancel && { onCancel }),
    });
  }, [
    onDelete,
    onArchive,
    onHoldResume,
    onCancel,
    onLogs,
    isArchived,
    isOnHold,
    deleteLabel,
  ]);

  return <Dropdown items={items} />;
}
