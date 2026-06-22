"use client";

import { AppFormModal, Textarea } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { ResourceType } from "@/constants";
import { FileCard } from "@/shared/ui/common";

interface ReshareDialogProps {
  files: Array<{
    id: number | string;
    title?: string;
    file?: string;
  }>;
  entityType: ResourceType;
  onClose: () => void;
}

export function ReshareDialog({
  files,
  entityType,
  onClose,
}: ReshareDialogProps) {
  const entityLabel =
    entityType === ResourceType.JOB ? ResourceType.JOB : ResourceType.LEAD;

  return (
    <AppFormModal
      isOpen
      showCancel
      submitLabel="Share"
      title="Re-share to farmers"
      width={530}
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onClose();
        toast.success("Files shared successfully");
      }}
    >
      <p className="text-text-muted text-sm">
        Share {entityLabel} information and files with the farmer portal.
      </p>
      <Textarea
        label="Description"
        placeholder="Add a description for this share"
        rows={3}
      />
      <div className="border-border-subtle flex max-h-[150px] flex-col gap-1 overflow-y-auto rounded-lg border p-2">
        {files.slice(0, 5).map((file) => (
          <FileCard
            key={file.id}
            checked={false}
            file={{
              ...file,
              displayTitle: file.title,
              url: file.file,
            }}
            onCheck={() => {}}
          />
        ))}
      </div>
    </AppFormModal>
  );
}
