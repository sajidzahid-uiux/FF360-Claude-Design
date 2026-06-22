"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AppFormModal } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { useCrewGroupMutations } from "@/hooks/mutations";
import { useCrewDirectoryList, useProjectTypesQuery } from "@/hooks/queries";
import { mapCrewDirectoryMembersToAvailable } from "@/shared/lib";

import {
  type CrewGroupFormEditContext,
  type CrewGroupFormMode,
  type CrewGroupFormValues,
  DEFAULT_CREW_GROUP_FORM_VALUES,
} from "../model/crewGroupForm";
import { CrewGroupFormFields } from "./CrewGroupFormFields";

export interface CrewGroupFormModalProps {
  open: boolean;
  mode: CrewGroupFormMode;
  editContext?: CrewGroupFormEditContext;
  onOpenChange: (open: boolean) => void;
}

function buildInitialValues(
  mode: CrewGroupFormMode,
  editContext?: CrewGroupFormEditContext
): CrewGroupFormValues {
  if (mode === "edit" && editContext) {
    return {
      name: editContext.name,
      selectedMemberIds: editContext.members
        .filter((member) => member.is_active)
        .map((member) => member.id),
      selectedProjectTypeIds: (editContext.project_types ?? []).map(
        (pt) => pt.id
      ),
      membersToDeactivate: [],
    };
  }

  return DEFAULT_CREW_GROUP_FORM_VALUES;
}

export function CrewGroupFormModal({
  open,
  mode,
  editContext,
  onOpenChange,
}: CrewGroupFormModalProps) {
  const [formValues, setFormValues] = useState<CrewGroupFormValues>(
    DEFAULT_CREW_GROUP_FORM_VALUES
  );
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [jobFilterSyncKey, setJobFilterSyncKey] = useState(0);

  const {
    createCrewGroup,
    updateCrewGroup,
    addMembersToGroup,
    deactivateMembersFromGroup,
    reactivateMembersInGroup,
  } = useCrewGroupMutations();
  const { data: projectTypes = [] } = useProjectTypesQuery();
  const { data: crewDirectoryData, isLoading: membersLoading } =
    useCrewDirectoryList(memberSearchTerm);

  const currentActiveIds = useMemo(
    () =>
      editContext?.members
        .filter((member) => member.is_active)
        .map((member) => member.id) ?? [],
    [editContext?.members]
  );

  const availableMembers = useMemo(() => {
    const directoryMembers = mapCrewDirectoryMembersToAvailable(
      crewDirectoryData?.members ?? []
    );
    if (mode !== "edit") return directoryMembers;
    return directoryMembers.filter(
      (member) => !currentActiveIds.includes(member.id)
    );
  }, [crewDirectoryData?.members, currentActiveIds, mode]);

  useEffect(() => {
    if (!open) {
      setFormValues(DEFAULT_CREW_GROUP_FORM_VALUES);
      setMemberSearchTerm("");
      setNameError(undefined);
      return;
    }

    setFormValues(buildInitialValues(mode, editContext));
    setMemberSearchTerm("");
    setNameError(undefined);
    setJobFilterSyncKey((key) => key + 1);
  }, [editContext, mode, open]);

  const isSubmitting =
    createCrewGroup.isPending ||
    updateCrewGroup.isPending ||
    addMembersToGroup.isPending ||
    deactivateMembersFromGroup.isPending ||
    reactivateMembersInGroup.isPending;

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  }, [isSubmitting, onOpenChange]);

  const canSubmit = useMemo(() => {
    if (!formValues.name.trim()) return false;
    if (mode === "create") {
      return formValues.selectedMemberIds.length > 0;
    }
    return true;
  }, [formValues.name, formValues.selectedMemberIds.length, mode]);

  const handleCreate = useCallback(async () => {
    await createCrewGroup.mutateAsync({
      name: formValues.name.trim(),
      members: formValues.selectedMemberIds,
      project_type_ids:
        formValues.selectedProjectTypeIds.length > 0
          ? formValues.selectedProjectTypeIds
          : undefined,
    });
    toast.success("Crew group created successfully");
    onOpenChange(false);
  }, [createCrewGroup, formValues, onOpenChange]);

  const handleEdit = useCallback(async () => {
    if (!editContext) return;

    const updatePayload: {
      name?: string;
      project_type_ids: number[];
    } = {
      project_type_ids: formValues.selectedProjectTypeIds,
    };

    if (!editContext.is_default && formValues.name !== editContext.name) {
      updatePayload.name = formValues.name.trim();
    }

    await updateCrewGroup.mutateAsync({
      crewGroupId: editContext.id,
      data: updatePayload,
    });

    if (formValues.membersToDeactivate.length > 0) {
      await deactivateMembersFromGroup.mutateAsync({
        crewGroupId: editContext.id,
        data: { members: Array.from(new Set(formValues.membersToDeactivate)) },
      });
    }

    const currentActiveMemberIds = editContext.members
      .filter((member) => member.is_active)
      .map((member) => member.id);
    const currentInactiveIds = editContext.members
      .filter((member) => !member.is_active)
      .map((member) => member.id);

    const newMembers = formValues.selectedMemberIds.filter(
      (id) =>
        !currentActiveMemberIds.includes(id) && !currentInactiveIds.includes(id)
    );
    const membersToReactivate = formValues.selectedMemberIds.filter((id) =>
      currentInactiveIds.includes(id)
    );

    if (newMembers.length > 0) {
      await addMembersToGroup.mutateAsync({
        crewGroupId: editContext.id,
        data: { members: newMembers },
      });
    }

    if (membersToReactivate.length > 0) {
      await reactivateMembersInGroup.mutateAsync({
        crewGroupId: editContext.id,
        data: { members: membersToReactivate },
      });
    }

    toast.success("Crew group updated successfully");
    onOpenChange(false);
  }, [
    addMembersToGroup,
    deactivateMembersFromGroup,
    editContext,
    formValues,
    onOpenChange,
    reactivateMembersInGroup,
    updateCrewGroup,
  ]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!formValues.name.trim()) {
      setNameError("Group name is required");
      toast.error("Please enter a group name");
      return;
    }

    if (mode === "create" && formValues.selectedMemberIds.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setNameError(undefined);

    try {
      if (mode === "create") {
        await handleCreate();
      } else {
        await handleEdit();
      }
    } catch {
      toast.error(
        mode === "create"
          ? "Failed to create crew group"
          : "Failed to update crew group"
      );
    }
  };

  const title = mode === "create" ? "Create crew group" : "Edit crew group";
  const submitLabel = mode === "create" ? "Add group" : "Save changes";

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
      submitDisabled={!canSubmit}
      submitLabel={submitLabel}
      title={title}
      width={720}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <CrewGroupFormFields
        availableMembers={availableMembers}
        currentMembers={editContext?.members}
        isDefault={editContext?.is_default}
        jobFilterSyncKey={jobFilterSyncKey}
        memberSearchTerm={memberSearchTerm}
        membersLoading={membersLoading}
        mode={mode}
        nameError={nameError}
        projectTypes={projectTypes}
        values={formValues}
        onChange={setFormValues}
        onMemberSearchTermChange={setMemberSearchTerm}
      />
    </AppFormModal>
  );
}
