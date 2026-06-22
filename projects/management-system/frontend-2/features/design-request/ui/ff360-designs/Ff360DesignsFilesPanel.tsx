"use client";

import { useCallback, useMemo } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { ExternalLink, Loader2 } from "lucide-react";

import type { DesignRequestSourceType } from "@/api/types/designRequest";
import { ResourceType } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOrganizationById } from "@/hooks/useOrganizationData";

import { useJobLeadFf360DesignFiles } from "../../hooks/useJobLeadFf360DesignFiles";
import type { DesignRequestEntityContext } from "../../lib/design-request-entity-context";
import { designRequestAccentHeaderClassName } from "../../lib/design-request-theme";
import { getSharedDesignOutputEmptyMessage } from "../../lib/shared-design-output";
import {
  useDesignRequestPanelIntegration,
  useDesignRequestPanelUi,
} from "../../model/design-request-panel-store";
import { DesignRequestStatusBadge } from "../shared/DesignRequestStatusBadge";
import { Ff360DesignFileRow } from "./Ff360DesignFileRow";

export interface Ff360DesignsFilesPanelProps {
  organizationId: string;
  entityType: ResourceType;
  entityId: number;
  entity: DesignRequestEntityContext;
  enabled: boolean;
}

export function Ff360DesignsFilesPanel({
  organizationId,
  entityType,
  entityId,
  entity,
  enabled,
}: Ff360DesignsFilesPanelProps) {
  const { currentUser } = useAuth();
  const { data: organization } = useOrganizationById(organizationId);
  const { openPanel } = useDesignRequestPanelIntegration();
  const { setActiveTab } = useDesignRequestPanelUi();

  const sourceType: DesignRequestSourceType =
    entityType === ResourceType.JOB ? "job" : "lead";

  const {
    canView,
    canSubmit,
    statusItem,
    files,
    loading,
    sharedOutput,
    sharedOutputForbidden,
    sharedOutputError,
  } = useJobLeadFf360DesignFiles(organizationId, sourceType, entityId, enabled);

  const panelScope = useMemo(
    () => ({
      organizationId,
      sourceType,
      sourceId: entityId,
      entity: {
        ...entity,
        organizationName: organization?.name ?? entity.organizationName,
        requestedByName:
          entity.requestedByName ||
          currentUser?.name?.trim() ||
          currentUser?.username?.trim() ||
          currentUser?.email ||
          "",
      },
    }),
    [
      currentUser,
      entity,
      entityId,
      organization?.name,
      organizationId,
      sourceType,
    ]
  );

  const handleOpenDesignPanel = useCallback(
    (tab: "files" | "details" = "files") => {
      openPanel(panelScope);
      setActiveTab(tab);
    },
    [openPanel, panelScope, setActiveTab]
  );

  if (!canView) {
    return null;
  }

  const emptySharedMessage = getSharedDesignOutputEmptyMessage(sharedOutput, {
    isLoading: false,
    isError: Boolean(sharedOutputError),
    isForbidden: sharedOutputForbidden,
  });

  return (
    <div className="border-border-subtle bg-bg-surface flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl border">
      <div
        className={`flex items-center justify-between gap-2 px-4 py-3 ${designRequestAccentHeaderClassName}`}
      >
        <h3 className="text-sm font-semibold">FF360 Designs</h3>
        <span className="rounded-full bg-black/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums">
          {files.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4">
        {statusItem ? (
          <div className="flex flex-wrap items-center gap-2">
            <DesignRequestStatusBadge status={statusItem.status} />
            <Button
              leftIcon={<ExternalLink aria-hidden className="h-3.5 w-3.5" />}
              title="Open design request"
              variant={ButtonVariantEnum.GHOST}
              onClick={() => handleOpenDesignPanel("files")}
            />
          </div>
        ) : null}

        {loading ? (
          <p className="text-text-muted flex items-center gap-2 text-sm">
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            Loading FF360 design files…
          </p>
        ) : null}

        {!loading && files.length > 0 ? (
          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <Ff360DesignFileRow key={file.id} file={file} />
            ))}
          </div>
        ) : null}

        {!loading && files.length === 0 ? (
          <p className="text-text-muted text-sm">
            {statusItem
              ? (emptySharedMessage ?? "No FF360 design files yet.")
              : "No FF360 design request for this record yet."}
          </p>
        ) : null}

        {!loading && !statusItem && canSubmit ? (
          <Button
            aria-label="Request Design from FF360"
            backgroundColor="var(--accent-design-request)"
            className="w-full"
            foregroundColor="var(--accent-design-request-foreground)"
            title="Request Design from FF360"
            variant={ButtonVariantEnum.COLORED}
            onClick={() => handleOpenDesignPanel("details")}
          />
        ) : null}
      </div>
    </div>
  );
}
