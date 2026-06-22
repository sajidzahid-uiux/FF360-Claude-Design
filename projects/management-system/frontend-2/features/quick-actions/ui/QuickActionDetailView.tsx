"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  Input,
  Textarea,
} from "@fieldflow360/org-ui";
import { format } from "date-fns";
import { Upload } from "lucide-react";

import type { QuickAction, QuickActionUpdatePayload } from "@/api/types";
import { ConversionType, ResourceType } from "@/constants/enums";
import {
  QuickActionConvertDropdown,
  getQuickActionDisplaySubtitle,
} from "@/features/quick-actions";
import {
  DetailFormSection,
  DetailReadOnlyField,
  DetailViewEditActions,
  DetailViewPage,
} from "@/shared/ui/common";

import { QuickActionFileRow } from "../QuickActionFileRow";

const FIELD_LIMITS = { name: 100 };

export interface QuickActionDetailViewProps {
  quickAction: QuickAction;
  onBack: () => void;
  onConvertContact: () => void;
  onConvertLead: () => void;
  onConvertJob: () => void;
  /** Called with payload when user clicks Save Changes (inline edit). */
  onSave?: (payload: QuickActionUpdatePayload) => void | Promise<void>;
  /** Called when user selects a file to upload (inline edit mode only). */
  onUploadFile?: (file: File) => void;
  /** Called when user clicks delete on a file (inline edit mode only). */
  onDeleteFile?: (fileId: number) => void;
  /**
   * Admin management (matches list `canManage` / legacy `isAdmin` gating).
   * Controls edit, convert, and whether file handlers may be used.
   */
  canManage?: boolean;
  /** @deprecated Prefer `canManage`. When omitted, falls back to `canManage`. */
  showConvertActions?: boolean;
  /** @deprecated Prefer `canManage`. When omitted, falls back to `canManage`. */
  showEditAction?: boolean;
  /** True while the PATCH request is in progress. */
  isSaving?: boolean;
  /** True while a file upload is in progress. */
  isUploading?: boolean;
}

export function QuickActionDetailView({
  quickAction,
  onBack,
  onConvertContact,
  onConvertLead,
  onConvertJob,
  onSave,
  onUploadFile,
  onDeleteFile,
  canManage = false,
  showConvertActions,
  showEditAction,
  isSaving = false,
  isUploading = false,
}: QuickActionDetailViewProps) {
  const allowManage = showEditAction ?? canManage;
  const allowConvert = showConvertActions ?? canManage;
  const canEditInline = allowManage && Boolean(onSave);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displaySubtitle = getQuickActionDisplaySubtitle(quickAction);
  const createdLabel = quickAction.created_at
    ? format(new Date(quickAction.created_at), "dd-MMM-yy, h:mm a")
    : "—";
  const files = quickAction.files ?? [];
  const convertedTo = quickAction.converted_to ?? null;
  const conversionTypes = (quickAction.conversion?.conversion_type ??
    []) as string[];
  const contactConverted = Array.isArray(conversionTypes)
    ? conversionTypes.includes(ConversionType.CONTACT)
    : conversionTypes === ConversionType.CONTACT;
  const leadConverted = Array.isArray(conversionTypes)
    ? conversionTypes.includes(ConversionType.LEAD)
    : conversionTypes === ConversionType.LEAD ||
      convertedTo === ResourceType.LEAD;
  const jobConverted = Array.isArray(conversionTypes)
    ? conversionTypes.includes(ConversionType.JOB)
    : conversionTypes === ConversionType.JOB ||
      convertedTo === ResourceType.JOB;

  const [name, setName] = useState(quickAction.name ?? "");
  const [email, setEmail] = useState(quickAction.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(
    quickAction.phone_number ?? ""
  );
  const [description, setDescription] = useState(quickAction.description ?? "");

  const [isEditing, setIsEditing] = useState(false);
  const canMutateFiles = canEditInline && isEditing;

  useEffect(() => {
    setIsEditing(false);
  }, [quickAction.id]);

  useEffect(() => {
    setName(quickAction.name ?? "");
    setEmail(quickAction.email ?? "");
    setPhoneNumber(quickAction.phone_number ?? "");
    setDescription(quickAction.description ?? "");
  }, [
    quickAction.id,
    quickAction.name,
    quickAction.email,
    quickAction.phone_number,
    quickAction.description,
  ]);

  const isDirty = useMemo(
    () =>
      (quickAction.name ?? "") !== name ||
      (quickAction.email ?? "") !== email ||
      (quickAction.phone_number ?? "") !== phoneNumber ||
      (quickAction.description ?? "") !== description,
    [
      quickAction.name,
      quickAction.email,
      quickAction.phone_number,
      quickAction.description,
      name,
      email,
      phoneNumber,
      description,
    ]
  );

  const canSave = isDirty && !isSaving;

  const handleSave = () => {
    if (!onSave) {
      return;
    }
    const payload: QuickActionUpdatePayload = {
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      phone_number: phoneNumber.trim() || undefined,
      description: description.trim() || undefined,
    };
    onSave(payload);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(quickAction.name ?? "");
    setEmail(quickAction.email ?? "");
    setPhoneNumber(quickAction.phone_number ?? "");
    setDescription(quickAction.description ?? "");
    setIsEditing(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadFile) {
      onUploadFile(file);
      e.target.value = "";
    }
  };

  return (
    <DetailViewPage
      actions={
        <>
          <DetailViewEditActions
            canEdit={canEditInline}
            canSave={canSave}
            editAriaLabel="Edit quick action"
            isEditing={isEditing}
            isSaving={isSaving}
            onCancel={handleCancel}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
          />
          {allowConvert ? (
            <QuickActionConvertDropdown
              contactConverted={contactConverted}
              jobConverted={jobConverted}
              leadConverted={leadConverted}
              onConvertContact={onConvertContact}
              onConvertJob={onConvertJob}
              onConvertLead={onConvertLead}
            />
          ) : null}
        </>
      }
      backLabel="Back to Quick Actions"
      className="flex-1"
      meta={
        <>
          <p className="text-text-muted text-sm">Created {createdLabel}</p>
          {quickAction.created_by_name ? (
            <p className="text-text-muted text-sm">
              by {quickAction.created_by_name}
            </p>
          ) : null}
        </>
      }
      subtitle={displaySubtitle}
      onBack={onBack}
    >
      <DetailFormSection
        description="Contact details captured for this quick action."
        title="Basic information"
      >
        {canEditInline && isEditing ? (
          <>
            <p className="text-text-muted text-sm">
              Update quick action details below, then save your changes.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                helperText={`${name.length}/${FIELD_LIMITS.name}`}
                id="qa-name"
                label="Name"
                maxLength={FIELD_LIMITS.name}
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                id="qa-email"
                label="Email"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                id="qa-phone"
                label="Phone number"
                maxLength={15}
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Textarea
              className="min-h-[80px] resize-y"
              id="qa-description"
              label="Description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </>
        ) : (
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <DetailReadOnlyField label="Name" value={quickAction.name ?? ""} />
            <DetailReadOnlyField
              label="Email"
              value={quickAction.email ?? ""}
            />
            <DetailReadOnlyField
              label="Phone number"
              value={quickAction.phone_number ?? ""}
            />
            <div className="min-w-0 sm:col-span-2">
              <DetailReadOnlyField
                preserveLineBreaks
                label="Description"
                value={quickAction.description ?? ""}
              />
            </div>
          </div>
        )}
      </DetailFormSection>

      <DetailFormSection title="Files">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-text-muted text-sm">
            {files.length === 0
              ? "No files attached to this quick action."
              : `${files.length} file${files.length === 1 ? "" : "s"} attached`}
          </p>
          {canMutateFiles && onUploadFile ? (
            <>
              <input
                ref={fileInputRef}
                accept="*/*"
                className="hidden"
                type="file"
                onChange={handleFileInputChange}
              />
              <Button
                disabled={isUploading}
                leftIcon={<Upload aria-hidden className="h-4 w-4" />}
                title={isUploading ? "Uploading..." : "Upload file"}
                variant={ButtonVariantEnum.SURFACE}
                onClick={() => fileInputRef.current?.click()}
              />
            </>
          ) : null}
        </div>

        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file) => (
              <QuickActionFileRow
                key={file.id}
                file={file}
                variant="card"
                onDelete={
                  canMutateFiles && onDeleteFile ? onDeleteFile : undefined
                }
              />
            ))}
          </div>
        ) : null}
      </DetailFormSection>
    </DetailViewPage>
  );
}
