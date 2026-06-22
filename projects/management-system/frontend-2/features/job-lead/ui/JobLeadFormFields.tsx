"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  Checkbox,
  Dropdown,
  Textarea,
} from "@fieldflow360/org-ui";
import { AlignLeft, ChevronDown, ChevronUp, PlusCircle } from "lucide-react";

import type { ProjectTypeCategory, Status, TeamMember } from "@/api/types";
import type { JobLeadTypeSegment } from "@/constants";
import { ResourceType } from "@/constants/enums";
import { ON_SITE_OPERATION_LABEL } from "@/features/contacts/model/constants";
import { getEquipmentTypeLabel } from "@/features/equipment";
import { mapTeamMembersToDesignerSelectOptions } from "@/features/forms";
import {
  DEFAULT_JOB_LEAD_FORM_STATE,
  JOB_LEAD_DESCRIPTION_MAX,
  type JobLeadFormState,
} from "@/features/job-lead/model/jobLeadForm";
import { JobContactSelect } from "@/features/job-lead/ui/JobContactSelect";
import { useRouteIds } from "@/hooks";
import { useFarmPermissions } from "@/hooks/permissions";
import { useProjectTypesQuery } from "@/hooks/queries";
import { useJobRecords } from "@/hooks/useRecordData";
import { orgUrl } from "@/shared/config/routes";

function CharCount({ current, max }: { current: number; max: number }) {
  return (
    <p className="text-text-muted text-xs">
      {current}/{max}
    </p>
  );
}

function FormSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-text-primary text-base font-semibold">{title}</h3>
          {description ? (
            <p className="text-text-muted mt-0.5 text-sm">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-border-subtle rounded-xl border">
      <button
        className="hover:bg-bg-hover/30 flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <div className="min-w-0">
          <p className="text-text-primary text-sm font-semibold">{title}</p>
          {description ? (
            <p className="text-text-muted mt-0.5 text-xs">{description}</p>
          ) : null}
        </div>
        {open ? (
          <ChevronUp aria-hidden className="text-text-muted h-4 w-4 shrink-0" />
        ) : (
          <ChevronDown
            aria-hidden
            className="text-text-muted h-4 w-4 shrink-0"
          />
        )}
      </button>
      {open ? (
        <div className="border-border-subtle space-y-4 border-t px-4 pt-4 pb-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function MultiCheckboxField({
  label,
  helperText,
  error,
  options,
  values,
  onChange,
  emptyText,
}: {
  label: string;
  helperText?: string;
  error?: string;
  options: { value: number; label: string }[];
  values: number[];
  onChange: (values: number[]) => void;
  emptyText: string;
}) {
  const toggle = (id: number, checked: boolean) => {
    onChange(
      checked ? [...values, id] : values.filter((entry) => entry !== id)
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-text-primary text-sm font-medium">{label}</p>
      {error ? (
        <p className="text-feedback-error text-sm">{error}</p>
      ) : helperText ? (
        <p className="text-text-muted text-xs">{helperText}</p>
      ) : null}
      <div className="border-border-subtle max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
        {options.length === 0 ? (
          <p className="text-text-muted px-2 py-3 text-sm">{emptyText}</p>
        ) : (
          options.map((option) => {
            const inputId = `${label}-${option.value}`;
            const checked = values.includes(option.value);

            return (
              <label
                key={option.value}
                className="hover:bg-bg-hover/40 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors"
                htmlFor={inputId}
              >
                <Checkbox
                  checked={checked}
                  id={inputId}
                  onChange={(event) =>
                    toggle(option.value, event.target.checked)
                  }
                />
                <span className="text-text-primary text-sm">
                  {option.label}
                </span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

export interface JobLeadFormFieldsProps {
  entity: ResourceType;
  recordJobType: JobLeadTypeSegment;
  value: JobLeadFormState;
  onChange: (value: JobLeadFormState) => void;
  fieldErrors: Record<string, string>;
  onFieldChange?: (field: keyof JobLeadFormState) => void;
  projectTypeCategory?: ProjectTypeCategory;
  leadSourcePlaceholder?: string;
  descriptionPlaceholder: string;
  includeDesigners?: boolean;
  includeEquipment?: boolean;
  leadTypes?: Status[];
  designers?: TeamMember[];
}

export function JobLeadFormFields({
  entity,
  recordJobType,
  value,
  onChange,
  fieldErrors,
  onFieldChange,
  projectTypeCategory,
  leadSourcePlaceholder,
  descriptionPlaceholder,
  includeDesigners = false,
  includeEquipment = false,
  leadTypes = [],
  designers = [],
}: JobLeadFormFieldsProps) {
  const router = useRouter();
  const { orgId } = useRouteIds();
  const { canAdd: canAddFarm } = useFarmPermissions();
  const formData = value ?? DEFAULT_JOB_LEAD_FORM_STATE;

  const contactId = formData.selectedContact
    ? parseInt(formData.selectedContact, 10)
    : undefined;

  const { farms, equipment } = useJobRecords(
    recordJobType,
    entity === ResourceType.JOB ? ResourceType.JOB : ResourceType.LEAD,
    { contactId: Number.isNaN(contactId ?? NaN) ? undefined : contactId }
  );

  const { data: projectTypes = [], isFetching: projectTypesLoading } =
    useProjectTypesQuery({
      category: projectTypeCategory,
      enabled: entity === ResourceType.JOB,
    });

  const farmsList = useMemo(
    () =>
      Array.isArray(farms.data) ? farms.data : (farms.data?.results ?? []),
    [farms.data]
  );

  const equipmentsList = useMemo(
    () =>
      Array.isArray(equipment.data)
        ? equipment.data
        : (equipment.data?.results ?? []),
    [equipment.data]
  );

  const designerOptions = useMemo(
    () => mapTeamMembersToDesignerSelectOptions(designers),
    [designers]
  );

  const leadSourceOptions = useMemo(() => {
    const sorted = [...leadTypes].sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    );
    return sorted.map((type) => ({
      value: String(type.id),
      label: type.title,
    }));
  }, [leadTypes]);

  const projectTypeOptions = useMemo(
    () =>
      projectTypes.map((type) => ({
        value: String(type.id),
        label: type.name,
      })),
    [projectTypes]
  );

  const farmOptions = useMemo(
    () =>
      farmsList.map((farm) => ({
        value: String(farm.id),
        label: `${farm.name} (${farm.acreage} acres)`,
      })),
    [farmsList]
  );

  const equipmentOptions = useMemo(
    () =>
      equipmentsList.map((item) => ({
        value: item.id,
        label: `${item.name} · ${item.serial_number} (${getEquipmentTypeLabel(item.equipment_type)})`,
      })),
    [equipmentsList]
  );

  const patch = (partial: Partial<JobLeadFormState>) => {
    onChange({ ...formData, ...partial });
  };

  const touch = (field: keyof JobLeadFormState) => {
    onFieldChange?.(field);
  };

  const farmPlaceholder = !formData.selectedContact
    ? "Select a contact first"
    : farms.isLoading
      ? "Loading farms…"
      : farmOptions.length === 0
        ? "No farms for this contact"
        : "Select a farm (optional)";

  return (
    <div className="space-y-6">
      <FormSection
        description={
          entity === ResourceType.JOB
            ? "Link this job to a contact and project type."
            : "Link this lead to a contact and source."
        }
        title="Basics"
      >
        <JobContactSelect
          error={fieldErrors.selectedContact}
          recordJobType={recordJobType}
          resourceType={
            entity === ResourceType.JOB ? ResourceType.JOB : ResourceType.LEAD
          }
          value={formData.selectedContact}
          onChange={(next) => {
            patch({ selectedContact: next, selectedFarm: "" });
            touch("selectedContact");
          }}
        />

        {entity === ResourceType.JOB ? (
          <Dropdown
            fullWidth
            disabled={projectTypesLoading}
            error={fieldErrors.projectTypeId}
            helperText={
              projectTypesLoading
                ? "Loading project types…"
                : projectTypeOptions.length === 0
                  ? "Add project types in organization settings."
                  : undefined
            }
            label="Project type *"
            options={projectTypeOptions}
            placeholder={
              projectTypesLoading ? "Loading…" : "Select project type"
            }
            value={formData.projectTypeId || undefined}
            onChange={(next) => {
              patch({ projectTypeId: next });
              touch("projectTypeId");
            }}
          />
        ) : (
          <Dropdown
            fullWidth
            error={fieldErrors.lead_type}
            helperText="How this lead entered your pipeline."
            label="Lead source *"
            options={leadSourceOptions}
            placeholder={leadSourcePlaceholder ?? "Select lead source"}
            value={formData.lead_type || undefined}
            onChange={(next) => {
              patch({ lead_type: next });
              touch("lead_type");
            }}
          />
        )}
      </FormSection>

      <CollapsibleSection
        description={`${ON_SITE_OPERATION_LABEL}, notes, and team — optional but helpful.`}
        title="Details"
      >
        <div className="space-y-1.5">
          <label
            className="text-text-primary block text-sm font-medium"
            htmlFor="job-lead-description"
          >
            <span className="inline-flex items-center gap-2">
              <AlignLeft aria-hidden className="h-4 w-4" strokeWidth={2} />
              Description
            </span>
          </label>
          <Textarea
            id="job-lead-description"
            maxLength={JOB_LEAD_DESCRIPTION_MAX}
            placeholder={descriptionPlaceholder}
            value={formData.description}
            onChange={(event) => {
              patch({ description: event.target.value });
              touch("description");
            }}
          />
          <CharCount
            current={formData.description.length}
            max={JOB_LEAD_DESCRIPTION_MAX}
          />
        </div>

        <div className="space-y-2">
          <Dropdown
            fullWidth
            disabled={!formData.selectedContact || farms.isLoading}
            error={fieldErrors.selectedFarm}
            helperText="Optional. Location data comes from the selected farm."
            label={ON_SITE_OPERATION_LABEL}
            options={farmOptions}
            placeholder={farmPlaceholder}
            value={formData.selectedFarm || undefined}
            onChange={(next) => {
              patch({ selectedFarm: next });
              touch("selectedFarm");
            }}
          />
          {formData.selectedContact && canAddFarm && orgId ? (
            <Button
              aria-label="Add farm for this contact"
              leftIcon={
                <PlusCircle aria-hidden className="h-4 w-4" strokeWidth={2} />
              }
              title="Add farm for this contact"
              variant={ButtonVariantEnum.GHOST}
              onClick={() =>
                router.push(
                  orgUrl(
                    orgId,
                    `/contact/${formData.selectedContact}`,
                    "action=add"
                  )
                )
              }
            />
          ) : null}
        </div>

        {includeDesigners ? (
          <MultiCheckboxField
            emptyText="No designers available."
            helperText="Assign designers who will work on this record."
            label="Designers"
            options={designerOptions.map((option) => ({
              value: option.value,
              label: option.accessibilityLabel,
            }))}
            values={formData.selectedDesigners}
            onChange={(next) => {
              patch({ selectedDesigners: next });
              touch("selectedDesigners");
            }}
          />
        ) : null}
      </CollapsibleSection>

      {entity === ResourceType.JOB && includeEquipment ? (
        <CollapsibleSection
          description="Attach equipment used on this job."
          title="Equipment"
        >
          <MultiCheckboxField
            emptyText="No equipment available for this job type."
            helperText="Select one or more pieces of equipment."
            label="Equipment"
            options={equipmentOptions}
            values={formData.selectedEquipment}
            onChange={(next) => {
              patch({ selectedEquipment: next });
              touch("selectedEquipment");
            }}
          />
        </CollapsibleSection>
      ) : null}
    </div>
  );
}
