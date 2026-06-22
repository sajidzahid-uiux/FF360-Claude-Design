"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AppFormModal, Loader } from "@fieldflow360/org-ui";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QuickActionsService } from "@/api/services";
import {
  hasQuickActionFormContent,
  validateQuickActionFormFields,
} from "@/features/quick-actions/lib/quick-action-form-validation";
import {
  type QuickActionEditSubmitPayload,
  type QuickActionFormValues,
  quickActionToFormValues,
} from "@/features/quick-actions/model/quickActionForm";
import { QuickActionFormFields } from "@/features/quick-actions/ui/QuickActionFormFields";
import { useMapping, useRouteIds } from "@/hooks";
import { useUpdateQuickAction } from "@/hooks/mutations";
import { quickActionsKeys, useQuickAction } from "@/hooks/queries";

export interface EditQuickActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quickActionId: number | null;
}

export function EditQuickActionModal({
  open,
  onOpenChange,
  quickActionId,
}: EditQuickActionModalProps) {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();
  const updateMutation = useUpdateQuickAction();
  const [isFileOpsInProgress, setIsFileOpsInProgress] = useState(false);
  const [formData, setFormData] = useState<QuickActionFormValues | null>(null);
  const [removedExistingFileIds, setRemovedExistingFileIds] = useState<
    number[]
  >([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data: contentTypes } = useMapping("content_types");
  const contentTypeId = contentTypes?.find(
    (type: { id: number; model: string }) =>
      type.model === "quickaction" || type.model === "quick_action"
  )?.id;

  const {
    data: quickAction,
    isLoading,
    error,
  } = useQuickAction(quickActionId ?? undefined, open && quickActionId != null);

  const isSubmitting = updateMutation.isPending || isFileOpsInProgress;

  const existingFiles = useMemo(
    () => quickAction?.files ?? [],
    [quickAction?.files]
  );

  useEffect(() => {
    if (!open) {
      setFormData(null);
      setRemovedExistingFileIds([]);
      setFieldErrors({});
      return;
    }

    if (quickAction) {
      setFormData(quickActionToFormValues(quickAction));
      setRemovedExistingFileIds([]);
      setFieldErrors({});
    }
  }, [open, quickAction]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  }, [isSubmitting, onOpenChange]);

  const handleFieldChange = useCallback(
    (field: keyof QuickActionFormValues) => {
      setFieldErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    },
    []
  );

  const handleRemoveExistingFile = useCallback((fileId: number) => {
    setRemovedExistingFileIds((current) =>
      current.includes(fileId) ? current : [...current, fileId]
    );
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!quickAction || !formData) return;

    const errors = validateQuickActionFormFields(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const keptFileIds = existingFiles
      .filter((file) => !removedExistingFileIds.includes(file.id))
      .map((file) => file.id);

    if (!hasQuickActionFormContent(formData, keptFileIds.length)) {
      toast.error(
        "Please provide at least one of: name, phone, email, description, or file(s)."
      );
      return;
    }

    const payload: QuickActionEditSubmitPayload = {
      values: formData,
      keptFileIds,
    };

    const updateBody = {
      name: payload.values.name.trim() || undefined,
      phone_number: payload.values.phone_number.trim() || undefined,
      email: payload.values.email.trim() || undefined,
      description: payload.values.description.trim() || undefined,
    };

    const removedFileIds = existingFiles
      .map((file) => file.id)
      .filter((id) => !payload.keptFileIds.includes(id));
    const newFiles = payload.values.files;

    updateMutation.mutate(
      { id: quickAction.id, payload: updateBody },
      {
        onSuccess: async () => {
          const hasFileOps = removedFileIds.length > 0 || newFiles.length > 0;
          if (hasFileOps && organizationId) {
            setIsFileOpsInProgress(true);
            try {
              let deleteFailed = 0;
              for (const fileId of removedFileIds) {
                try {
                  await QuickActionsService.deleteFile(organizationId, fileId);
                } catch {
                  deleteFailed += 1;
                }
              }

              let uploadFailed = 0;
              if (newFiles.length > 0 && contentTypeId != null) {
                for (const file of newFiles) {
                  try {
                    await QuickActionsService.uploadFileForQuickAction(
                      organizationId,
                      quickAction.id,
                      contentTypeId,
                      {
                        file,
                        title: `other_file_${file.name}`,
                        description: "—",
                      }
                    );
                  } catch {
                    uploadFailed += 1;
                  }
                }
                if (uploadFailed > 0) {
                  toast.error(
                    `${uploadFailed} file(s) failed to upload. Other changes were saved.`
                  );
                }
              }

              if (deleteFailed > 0) {
                toast.error(
                  `${deleteFailed} file(s) could not be removed. Other changes were saved.`
                );
              }
            } finally {
              setIsFileOpsInProgress(false);
            }
          }

          if (organizationId) {
            queryClient.invalidateQueries({
              queryKey: quickActionsKeys.all(organizationId),
            });
            queryClient.invalidateQueries({
              queryKey: quickActionsKeys.detail(organizationId, quickAction.id),
            });
          }

          onOpenChange(false);
        },
      }
    );
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={open}
      isSubmitting={isSubmitting}
      maxHeight="calc(100vh - 4rem)"
      submitDisabled={isLoading || Boolean(error) || !formData}
      submitLabel="Save"
      title="Edit Quick Action"
      width={720}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      {isLoading || !formData ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader text="Loading quick action..." />
        </div>
      ) : error ? (
        <p className="text-feedback-error text-sm">
          Failed to load quick action. Please try again.
        </p>
      ) : (
        <QuickActionFormFields
          existingFiles={existingFiles}
          fieldErrors={fieldErrors}
          newFilesLabel="Add files"
          removedExistingFileIds={removedExistingFileIds}
          value={formData}
          onChange={setFormData}
          onFieldChange={handleFieldChange}
          onRemoveExistingFile={handleRemoveExistingFile}
        />
      )}
    </AppFormModal>
  );
}
