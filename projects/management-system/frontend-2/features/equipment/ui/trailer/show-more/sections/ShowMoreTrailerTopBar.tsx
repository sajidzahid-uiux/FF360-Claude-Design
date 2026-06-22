import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { ArrowLeft, CheckCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { useShowMoreTrailerCard } from "@/features/equipment/hooks/useShowMoreTrailerCard";
import { ShowMoreExtraActionsDropdown } from "@/shared/ui/common";
import { getErrorMessage } from "@/utils/apiError";

type Vm = ReturnType<typeof useShowMoreTrailerCard>;

interface Props {
  vm: Vm;
  hasRestorePermission: boolean;
  hasDeletePermission: boolean;
  canDelete: boolean;
  onRestore?: () => void;
  onDelete?: () => void;
}

export function ShowMoreTrailerTopBar({
  vm,
  hasRestorePermission,
  hasDeletePermission,
  canDelete,
  onRestore,
  onDelete,
}: Props) {
  const {
    trailerData,
    dialogManager,
    trashTrailer,
    trailerRecordId,
    navigateToEquipmentLogs,
    effectiveCanRead,
    onClose,
    isTrashed,
  } = vm;

  return (
    <>
      {/* Top Bar */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <ArrowLeft className="cursor-pointer" onClick={onClose} />
          <span className="text-2xl font-bold sm:text-3xl">Trailers</span>
        </div>
        <div className="flex items-center justify-start gap-2 sm:justify-end">
          {isTrashed ? (
            <>
              {hasRestorePermission && (
                <Button
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                  title="Restore"
                  onClick={onRestore}
                />
              )}
              {hasDeletePermission && (
                <Button
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  title="Delete"
                  variant={ButtonVariantEnum.DELETE}
                  onClick={onDelete}
                />
              )}
            </>
          ) : (
            (canDelete || effectiveCanRead) && (
              <ShowMoreExtraActionsDropdown
                onDelete={() => {
                  const itemTitle =
                    trailerData.machine_name || trailerData.name || "Trailer";
                  dialogManager.openConfirmationDialog({
                    title: "Trash Trailer",
                    confirmationType: "delete",
                    itemTitle: itemTitle,
                    variant: "destructive",
                    confirmButtonText: "Move to Trash",
                    trash: true,
                    onConfirm: async () => {
                      try {
                        await trashTrailer.mutateAsync(trailerRecordId);
                        toast.success("Trailer deleted successfully");
                        onClose();
                        dialogManager.closeDialog();
                      } catch (error: unknown) {
                        toast.error(
                          getErrorMessage(error, "Failed to delete trailer")
                        );
                        dialogManager.setConfirmationProcessing(false);
                        throw error;
                      }
                    },
                  });
                }}
                onLogs={effectiveCanRead ? navigateToEquipmentLogs : undefined}
              />
            )
          )}
        </div>
      </div>
    </>
  );
}
