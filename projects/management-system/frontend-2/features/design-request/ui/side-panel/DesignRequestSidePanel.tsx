"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  TabsSwitcher,
  TabsSwitcherViewEnum,
  cn,
} from "@fieldflow360/org-ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, MapPin, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/api/client";
import { DesignRequestService } from "@/api/services";
import {
  DesignRequestDirection,
  type DesignRequestPanelTab,
} from "@/api/types/designRequest";
import { QUERY_KEYS } from "@/constants";
import { ComponentSizeEnum } from "@/lib/__mocks__/org-ui";

import { useDesignRequestAccess } from "../../hooks/useDesignRequestAccess";
import { useDesignRequestEffectiveStatus } from "../../hooks/useDesignRequestEffectiveStatus";
import { useDesignRequestThread } from "../../hooks/useDesignRequestThread";
import {
  DESIGN_REQUEST_SUBMIT_ALLOWED_EXTENSIONS,
  DESIGN_REQUEST_SUBMIT_FILE_MAX_BYTES,
  type DesignRequestFormValues,
  type LineTypeKey,
  emptyDesignRequestFormValues,
  lineTypeParamsFromForm,
} from "../../lib/constants";
import {
  REQUEST_SPACING_MAX_DIGITS,
  formatSpacingForApi,
} from "../../lib/design-parameters-validation";
import {
  getDesignRequestSubmitErrorMessage,
  isDuplicateActiveDesignRequestError,
} from "../../lib/design-request-api-errors";
import {
  readDesignRequestSnapshot,
  snapshotFromFormValues,
  writeDesignRequestSnapshot,
} from "../../lib/design-request-snapshot";
import {
  canResubmitDesignRequest,
  canWriteDesignRequestNotes,
  isActiveDesignRequestStatus,
  shouldShowDesignRequestSubmitForm,
} from "../../lib/design-request-status";
import { mapOrgDesignParametersToForm } from "../../lib/map-org-params-to-form";
import {
  type DesignRequestFormErrors,
  validateDesignRequestForm,
  validateSubmitFiles,
} from "../../lib/validate-design-request-form";
import { useDesignRequestPanelUi } from "../../model/design-request-panel-store";
import { DesignRequestStatusBadge } from "../shared/DesignRequestStatusBadge";
import { DesignRequestSubmitForm } from "./DesignRequestSubmitForm";
import { DesignRequestChatTab } from "./tabs/DesignRequestChatTab";
import { DesignRequestDetailsTab } from "./tabs/DesignRequestDetailsTab";
import { DesignRequestFilesTab } from "./tabs/DesignRequestFilesTab";

const PANEL_TABS: {
  id: DesignRequestPanelTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "details", label: "Details", icon: <MapPin className="h-4 w-4" /> },
  {
    id: "chat",
    label: "Chat",
    icon: <MessageCircle className="h-4 w-4" />,
  },
  { id: "files", label: "Files", icon: <FolderOpen className="h-4 w-4" /> },
];

export function DesignRequestSidePanel() {
  const queryClient = useQueryClient();
  const {
    isOpen,
    scope,
    activeTab,
    resubmitMode,
    closePanel,
    setActiveTab,
    setResubmitMode,
    setOptimisticStatus,
    resetPanelUi,
  } = useDesignRequestPanelUi();
  const { canSubmit } = useDesignRequestAccess();

  const [formValues, setFormValues] = useState<DesignRequestFormValues>(
    emptyDesignRequestFormValues()
  );
  const [formErrors, setFormErrors] = useState<DesignRequestFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const organizationId = scope?.organizationId;
  const sourceType = scope?.sourceType;
  const sourceId = scope?.sourceId;
  const entity = scope?.entity;

  const statusItem = useDesignRequestEffectiveStatus(
    organizationId,
    sourceType,
    sourceId,
    isOpen && Boolean(scope)
  );

  useEffect(() => {
    if (!isOpen) {
      resetPanelUi();
    }
  }, [isOpen, resetPanelUi]);

  const activeRequestId = statusItem?.id ?? null;
  const showSubmitForm =
    canSubmit && shouldShowDesignRequestSubmitForm(statusItem, resubmitMode);
  const hasExistingRequest = statusItem != null;
  const canResubmit =
    hasExistingRequest && canResubmitDesignRequest(statusItem.status);

  const submittedSnapshot =
    activeRequestId != null && organizationId
      ? readDesignRequestSnapshot(queryClient, organizationId, activeRequestId)
      : undefined;

  const { data: orgParams, error: orgParamsError } = useQuery({
    queryKey: [QUERY_KEYS.ORG_DESIGN_PARAMETERS, organizationId],
    queryFn: () => DesignRequestService.getOrgDesignParameters(organizationId!),
    enabled: isOpen && showSubmitForm && Boolean(organizationId),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 403) {
        return false;
      }
      return failureCount < 1;
    },
  });

  const orgParamsForbidden =
    orgParamsError instanceof ApiError && orgParamsError.status === 403;

  useEffect(() => {
    if (orgParams && showSubmitForm) {
      setFormValues((prev) => ({
        ...mapOrgDesignParametersToForm(orgParams),
        initialNotes: prev.initialNotes,
        files: prev.files,
      }));
    }
  }, [orgParams, showSubmitForm]);

  const {
    notes,
    notesLoading,
    sharedOutput,
    sharedOutputLoading,
    sharedOutputError,
    sharedOutputForbidden,
  } = useDesignRequestThread(organizationId, activeRequestId, {
    enabled: isOpen,
    activeTab,
    loadThread: !showSubmitForm,
  });

  const handleLineTypeFieldChange = useCallback(
    (
      lineType: LineTypeKey,
      field: keyof DesignRequestFormValues["main"],
      value: string
    ) => {
      setFormValues((prev) => ({
        ...prev,
        [lineType]: {
          ...prev[lineType],
          [field]: value,
        },
      }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || !organizationId || !sourceType || !entity) {
      return;
    }

    if (statusItem && isActiveDesignRequestStatus(statusItem.status)) {
      toast.message("A design request is already pending for this record.");
      return;
    }

    const validation = validateDesignRequestForm(formValues);
    if (!validation.ok) {
      setFormErrors(validation.errors);
      return;
    }
    const fileValidation = validateSubmitFiles(
      formValues.files,
      DESIGN_REQUEST_SUBMIT_ALLOWED_EXTENSIONS,
      DESIGN_REQUEST_SUBMIT_FILE_MAX_BYTES
    );
    if (fileValidation) {
      toast.error(fileValidation);
      return;
    }
    setFormErrors({});
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const created = await DesignRequestService.submit(organizationId, {
        source_type: sourceType,
        source_id: sourceId!,
        direction: formValues.direction as DesignRequestDirection,
        spacing: formatSpacingForApi(
          formValues.spacing,
          REQUEST_SPACING_MAX_DIGITS
        ),
        main_params: lineTypeParamsFromForm(formValues.main),
        submain_params: lineTypeParamsFromForm(formValues.submain),
        lateral_params: lineTypeParamsFromForm(formValues.lateral),
        initial_notes: formValues.initialNotes,
        files: formValues.files,
      });
      writeDesignRequestSnapshot(
        queryClient,
        organizationId,
        created.id,
        snapshotFromFormValues(formValues, entity.requestedByName)
      );
      setOptimisticStatus(created);
      setResubmitMode(false);
      setActiveTab("chat");
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DESIGN_REQUEST_STATUS, organizationId],
      });
      toast.success("Design request sent to FieldFlow360.");
    } catch (err: unknown) {
      if (isDuplicateActiveDesignRequestError(err)) {
        toast.message("A design request is already pending for this record.");
      } else {
        toast.error(getDesignRequestSubmitErrorMessage(err));
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [
    entity,
    formValues,
    organizationId,
    queryClient,
    setActiveTab,
    setOptimisticStatus,
    setResubmitMode,
    sourceId,
    sourceType,
    statusItem,
  ]);

  const currentStatus = statusItem?.status ?? null;
  const notesWritable =
    currentStatus != null && canWriteDesignRequestNotes(currentStatus);

  if (!isOpen || !scope || !entity) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close design request panel"
        className="animate-in fade-in absolute inset-0 bg-black/40 duration-200"
        type="button"
        onClick={closePanel}
      />
      <aside
        aria-label="FieldFlow360 Design Request"
        aria-modal="true"
        className={cn(
          "bg-bg-app relative z-10 flex h-full w-[50dvw] flex-col shadow-2xl",
          "animate-in slide-in-from-right duration-200"
        )}
        role="dialog"
      >
        <header className="border-border-subtle flex shrink-0 items-start justify-between gap-3 border-b p-5">
          <div>
            <h2 className="text-text-primary text-2xl font-bold">
              FieldFlow360 Design Request
            </h2>
            <p className="text-text-muted text-sm">Design outsourcing portal</p>
          </div>
          <div className="flex items-center gap-2">
            {currentStatus ? (
              <DesignRequestStatusBadge status={currentStatus} />
            ) : null}
            <Button
              iconOnly
              aria-label="Close"
              leftIcon={<X aria-hidden className="h-5 w-5" />}
              variant={ButtonVariantEnum.GHOST}
              onClick={closePanel}
            />
          </div>
        </header>

        {!showSubmitForm ? (
          <div className="mt-4">
            <TabsSwitcher
              fullWidth
              items={PANEL_TABS.map((tab) => ({
                value: tab.id,
                label: tab.label,
                icon: tab.icon,
              }))}
              size={ComponentSizeEnum.LG}
              value={activeTab}
              view={TabsSwitcherViewEnum.UNDERLINED}
              onChange={setActiveTab}
            />
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {showSubmitForm ? (
            <>
              {orgParamsForbidden ? (
                <p className="text-text-muted mb-4 text-sm">
                  Organization default parameters are admin-only. Enter values
                  below; the server still applies org defaults on submit when
                  fields are omitted.
                </p>
              ) : null}
              <DesignRequestSubmitForm
                errors={formErrors}
                values={formValues}
                onChange={setFormValues}
                onLineTypeFieldChange={handleLineTypeFieldChange}
              />
            </>
          ) : null}

          {!showSubmitForm && activeTab === "details" && statusItem ? (
            <DesignRequestDetailsTab
              entity={entity}
              snapshot={submittedSnapshot}
              status={statusItem.status}
              updatedAt={statusItem.updated_at}
            />
          ) : null}

          {!showSubmitForm &&
          activeTab === "chat" &&
          activeRequestId != null ? (
            <DesignRequestChatTab
              canPost={notesWritable}
              loading={notesLoading}
              notes={notes}
              requestStatus={currentStatus ?? ""}
            />
          ) : null}

          {!showSubmitForm &&
          activeTab === "files" &&
          activeRequestId != null ? (
            <DesignRequestFilesTab
              canUpload={notesWritable}
              notes={notes}
              requestStatus={currentStatus ?? ""}
              sharedOutput={sharedOutput}
              sharedOutputError={Boolean(sharedOutputError)}
              sharedOutputForbidden={sharedOutputForbidden}
              sharedOutputLoading={sharedOutputLoading}
            />
          ) : null}
        </div>

        {showSubmitForm ? (
          <footer className="border-border-subtle shrink-0 space-y-2 border-t p-5">
            {resubmitMode ? (
              <Button
                fullWidth
                aria-label="Back to notes and files"
                title="Back to notes and files"
                variant={ButtonVariantEnum.GHOST}
                onClick={() => setResubmitMode(false)}
              />
            ) : null}
            <Button
              fullWidth
              aria-label="Send Request to FieldFlow360"
              disabled={submitting}
              loading={submitting}
              title="Send Request to FieldFlow360"
              variant={ButtonVariantEnum.ACCENT}
              onClick={() => void handleSubmit()}
            />
          </footer>
        ) : canResubmit && canSubmit ? (
          <footer className="border-border-subtle shrink-0 border-t p-5">
            <Button
              fullWidth
              aria-label="Submit new design request"
              title="Submit new design request"
              variant={ButtonVariantEnum.ACCENT}
              onClick={() => setResubmitMode(true)}
            />
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
