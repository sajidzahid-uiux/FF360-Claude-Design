"use client";

import { useSearchParams } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AppFormModal, TabsSwitcher } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { ProjectTypeCategory, Status, TeamMember } from "@/api/types";
import type { JobLeadTypeSegment } from "@/constants";
import { ResourceType } from "@/constants/enums";
import {
  DEFAULT_JOB_LEAD_FORM_STATE,
  type JobCreateSubmitValues,
  type JobLeadFormState,
  type LeadCreateSubmitValues,
  isJobLeadFormSubmittable,
} from "@/features/job-lead/model/jobLeadForm";
import type { JobLeadTypeOption } from "@/features/job-lead/model/jobLeadRouteConfig";
import { JobLeadFormFields } from "@/features/job-lead/ui/JobLeadFormFields";
import { getPrimaryFarmGeo } from "@/features/jobs";
import { useLeadTypes, useTeamData } from "@/hooks";
import { useJobRecords } from "@/hooks/useRecordData";

type JobLeadFormSubmitValues = JobCreateSubmitValues | LeadCreateSubmitValues;

export interface JobLeadFormProps<
  TValues extends JobLeadFormSubmitValues = JobLeadFormSubmitValues,
> {
  entity?: ResourceType;
  recordJobType: JobLeadTypeSegment;
  formId: string;
  projectTypeCategory?: ProjectTypeCategory;
  leadSourcePlaceholder?: string;
  descriptionPlaceholder: string;
  includeEquipment?: boolean;
  includeDesigners?: boolean;
  equipmentWritePermission?: string;
  modalTitle?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isSubmitting?: boolean;
  onSubmit: (values: TValues) => void;
  onCancel: () => void;
  /** Repair/Excavation/Tile quick-switch tabs. When provided, shows a type switcher. */
  typeOptions?: JobLeadTypeOption[];
  /** Pre-selected type (e.g. from the list route the modal was opened on). */
  defaultSegment?: JobLeadTypeSegment;
  /** Require the user to pick a type before the rest of the form is enabled. */
  requireTypeSelection?: boolean;
}

function buildInitialFormState(
  searchParams: URLSearchParams,
  defaultLeadType: string
): JobLeadFormState {
  return {
    ...DEFAULT_JOB_LEAD_FORM_STATE,
    selectedContact: searchParams.get("contactId") || "",
    selectedFarm: searchParams.get("farmId") || "",
    lead_type: defaultLeadType,
  };
}

export function JobLeadForm<
  TValues extends JobLeadFormSubmitValues = JobLeadFormSubmitValues,
>({
  entity = ResourceType.LEAD,
  recordJobType,
  projectTypeCategory,
  leadSourcePlaceholder,
  descriptionPlaceholder,
  includeEquipment = false,
  includeDesigners = false,
  modalTitle,
  isOpen,
  onOpenChange,
  isSubmitting = false,
  onSubmit,
  onCancel,
  typeOptions,
  defaultSegment,
  requireTypeSelection = false,
}: JobLeadFormProps<TValues>) {
  const searchParams = useSearchParams();
  const { data: leadTypes } = useLeadTypes();
  const { data: members } = useTeamData();

  // Active type tab. Auto-selected from the route's segment unless the modal was
  // opened from the global "+" (requireTypeSelection), where the user picks first.
  const [activeSegment, setActiveSegment] = useState<
    JobLeadTypeSegment | undefined
  >(requireTypeSelection ? undefined : defaultSegment);

  const activeOption = useMemo(
    () => typeOptions?.find((option) => option.segment === activeSegment),
    [typeOptions, activeSegment]
  );

  // Effective per-type values: the active tab's option wins, else the props the
  // modal was constructed with (keeps behaviour identical when no typeOptions).
  const effectiveRecordJobType = activeOption?.recordJobType ?? recordJobType;
  const effectiveProjectTypeCategory =
    activeOption?.projectTypeCategory ?? projectTypeCategory;
  const effectiveLeadSourcePlaceholder =
    activeOption?.leadSourcePlaceholder ?? leadSourcePlaceholder;
  const effectiveDescriptionPlaceholder =
    activeOption?.descriptionPlaceholder ?? descriptionPlaceholder;
  const effectiveIncludeEquipment =
    activeOption?.includeEquipment ?? includeEquipment;
  const effectiveIncludeDesigners =
    activeOption?.includeDesigners ?? includeDesigners;

  const fieldsLocked = requireTypeSelection && !activeSegment;

  const defaultLeadType = useMemo(() => {
    const typed = leadTypes as Status[] | undefined;
    if (!typed?.length) return "";
    const followUp = typed.find((type) =>
      type.title.toLowerCase().includes("follow")
    );
    return String((followUp ?? typed[0]).id);
  }, [leadTypes]);

  const [formData, setFormData] = useState<JobLeadFormState>(() =>
    buildInitialFormState(searchParams, defaultLeadType)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const contactIdForFetch = formData.selectedContact
    ? parseInt(formData.selectedContact, 10)
    : undefined;
  const { farms } = useJobRecords(
    effectiveRecordJobType,
    entity === ResourceType.JOB ? ResourceType.JOB : ResourceType.LEAD,
    {
      contactId: Number.isNaN(contactIdForFetch ?? NaN)
        ? undefined
        : contactIdForFetch,
    }
  );
  const farmsList = useMemo(
    () =>
      Array.isArray(farms.data) ? farms.data : (farms.data?.results ?? []),
    [farms.data]
  );

  const modalVisible = isOpen ?? true;

  useEffect(() => {
    if (!modalVisible) return;
    setFormData(buildInitialFormState(searchParams, defaultLeadType));
    setFieldErrors({});
    setActiveSegment(requireTypeSelection ? undefined : defaultSegment);
  }, [
    defaultLeadType,
    defaultSegment,
    modalVisible,
    requireTypeSelection,
    searchParams,
  ]);

  const resolvedModalTitle =
    modalTitle ??
    (entity === ResourceType.JOB ? "Add New Job" : "Add New Lead");

  const submitLabel =
    entity === ResourceType.JOB ? "Create job" : "Create lead";

  const clearFieldError = useCallback((field: keyof JobLeadFormState) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.selectedContact.trim()) {
      errors.selectedContact = "Select a contact";
    }
    if (entity === ResourceType.JOB && !formData.projectTypeId.trim()) {
      errors.projectTypeId = "Select a project type";
    }
    if (entity === ResourceType.LEAD && !formData.lead_type.trim()) {
      errors.lead_type = "Select a lead source";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [
    entity,
    formData.lead_type,
    formData.projectTypeId,
    formData.selectedContact,
  ]);

  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (!validate()) {
        toast.error("Please fix the highlighted fields.");
        return;
      }

      const selectedFarm = farmsList.find(
        (farm) => farm.id === parseInt(formData.selectedFarm || "0", 10)
      );

      const locationFields = selectedFarm
        ? getPrimaryFarmGeo([selectedFarm.id], [selectedFarm])
        : {};

      const payload: JobLeadFormSubmitValues =
        entity === ResourceType.JOB
          ? {
              selectedContact: formData.selectedContact,
              selectedFarm: formData.selectedFarm || undefined,
              description: formData.description,
              projectTypeId: parseInt(formData.projectTypeId, 10),
              equipments: formData.selectedEquipment.map((id) => ({
                equipment: id,
              })),
              designers: formData.selectedDesigners,
              crew: [],
              acre: selectedFarm?.acreage?.toString(),
              ...locationFields,
            }
          : {
              selectedContact: formData.selectedContact,
              selectedFarm: formData.selectedFarm || undefined,
              lead_type: parseInt(formData.lead_type, 10),
              description: formData.description,
              designers: formData.selectedDesigners,
              acre: selectedFarm?.acreage,
              ...locationFields,
            };

      onSubmit(payload as TValues);
    },
    [entity, farmsList, formData, onSubmit, validate]
  );

  const handleClose = () => {
    if (!isSubmitting) {
      onCancel();
      onOpenChange?.(false);
    }
  };

  const submitDisabled =
    fieldsLocked || !isJobLeadFormSubmittable(entity, formData);

  const typeNoun = entity === ResourceType.JOB ? "job" : "lead";

  const typeSwitcher =
    typeOptions && typeOptions.length > 0 ? (
      <div className="space-y-1.5">
        <p className="text-text-primary text-sm font-medium">
          {entity === ResourceType.JOB ? "Job type *" : "Lead type *"}
        </p>
        <TabsSwitcher
          items={typeOptions.map((option) => ({
            value: option.segment,
            label: option.label,
          }))}
          value={activeSegment ?? ""}
          onChange={(next) => setActiveSegment(next as JobLeadTypeSegment)}
        />
        {fieldsLocked ? (
          <p className="text-text-muted text-xs">
            Select a {typeNoun} type to continue.
          </p>
        ) : null}
      </div>
    ) : null;

  const formFields = (
    <div className="space-y-6">
      {typeSwitcher}
      {fieldsLocked ? null : (
        <JobLeadFormFields
          descriptionPlaceholder={effectiveDescriptionPlaceholder}
          designers={(members as TeamMember[] | undefined) ?? []}
          entity={entity}
          fieldErrors={fieldErrors}
          includeDesigners={effectiveIncludeDesigners}
          includeEquipment={effectiveIncludeEquipment}
          leadSourcePlaceholder={effectiveLeadSourcePlaceholder}
          leadTypes={(leadTypes as Status[] | undefined) ?? []}
          projectTypeCategory={effectiveProjectTypeCategory}
          recordJobType={effectiveRecordJobType}
          value={formData}
          onChange={setFormData}
          onFieldChange={clearFieldError}
        />
      )}
    </div>
  );

  if (isOpen === undefined) {
    return (
      <div className="bg-bg-surface-elevated mx-auto w-full max-w-[740px] rounded-xl p-6">
        <h2 className="text-text-primary mb-6 text-xl font-semibold">
          {resolvedModalTitle}
        </h2>
        {formFields}
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="text-text-muted text-sm font-medium"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-accent text-text-on-accent rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
            disabled={submitDisabled || isSubmitting}
            type="button"
            onClick={() => void handleSubmit()}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={isOpen}
      isSubmitting={isSubmitting}
      maxHeight="calc(100dvh - 1rem)"
      submitDisabled={submitDisabled}
      submitLabel={submitLabel}
      title={resolvedModalTitle}
      width={entity === ResourceType.JOB ? 760 : 680}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      {formFields}
    </AppFormModal>
  );
}
