"use client";

import { useCallback, useMemo } from "react";

import type { DesignRequestSourceType } from "@/api/types/designRequest";
import { ResourceType } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useOrganizationById } from "@/hooks/useOrganizationData";

import { useDesignRequestAccess } from "../../hooks/useDesignRequestAccess";
import { useDesignRequestEffectiveStatus } from "../../hooks/useDesignRequestEffectiveStatus";
import { useDesignRequestRealtimeSync } from "../../hooks/useDesignRequestRealtimeSync";
import type { DesignRequestEntityContext } from "../../lib/design-request-entity-context";
import { useDesignRequestPanelIntegration } from "../../model/design-request-panel-store";
import { DesignRequestSidePanel } from "../side-panel/DesignRequestSidePanel";
import { JobLeadDesignRequestFooter } from "./JobLeadDesignRequestFooter";

export interface DesignRequestJobLeadIntegrationProps {
  organizationId: string;
  entityType: ResourceType;
  entityId: number;
  jobTitle: string;
  clientName?: string;
  farmName?: string;
  isTiling: boolean;
  onOpenNotes?: () => void;
  onLogs?: () => void;
  onOneCall?: () => void;
  oneCallActive?: boolean;
  oneCallDate?: string | null;
  canEdit?: boolean;
}

function resolveDisplayName(
  currentUser: ReturnType<typeof useAuth>["currentUser"]
): string {
  if (!currentUser) return "";
  return (
    currentUser.name?.trim() ||
    currentUser.username?.trim() ||
    currentUser.email ||
    ""
  );
}

export function DesignRequestJobLeadIntegration({
  organizationId,
  entityType,
  entityId,
  jobTitle,
  clientName = "",
  farmName = "",
  isTiling,
  onOpenNotes,
  onLogs,
  onOneCall,
  oneCallActive,
  oneCallDate,
  canEdit,
}: DesignRequestJobLeadIntegrationProps) {
  const { canSubmit, canView, isLoading } = useDesignRequestAccess();
  const { currentUser } = useAuth();
  const { data: organization } = useOrganizationById(organizationId);
  const { openPanel, optimisticStatus } = useDesignRequestPanelIntegration();

  const sourceType: DesignRequestSourceType =
    entityType === ResourceType.JOB ? "job" : "lead";

  const enabled = isTiling && entityId > 0 && !isLoading && canView;

  const entityContext = useMemo(
    (): DesignRequestEntityContext => ({
      organizationName: organization?.name ?? "",
      clientName,
      farmName,
      jobTitle,
      requestedByName: resolveDisplayName(currentUser),
    }),
    [clientName, currentUser, farmName, jobTitle, organization?.name]
  );

  const panelScope = useMemo(
    () => ({
      organizationId,
      sourceType,
      sourceId: entityId,
      entity: entityContext,
    }),
    [entityContext, entityId, organizationId, sourceType]
  );

  const statusItem = useDesignRequestEffectiveStatus(
    organizationId,
    sourceType,
    entityId,
    enabled
  );

  const trackedRequestIds = useMemo(() => {
    const ids = new Set<number>();
    if (statusItem?.id != null) ids.add(statusItem.id);
    if (optimisticStatus?.id != null) ids.add(optimisticStatus.id);
    return [...ids];
  }, [optimisticStatus?.id, statusItem?.id]);

  useDesignRequestRealtimeSync({
    organizationId,
    sourceType,
    sourceId: entityId,
    trackedRequestIds,
    enabled,
  });

  const handleOpenPanel = useCallback(() => {
    openPanel(panelScope);
  }, [openPanel, panelScope]);

  if (!enabled || (!canSubmit && !statusItem)) {
    if (!onLogs && !onOneCall && !onOpenNotes) return null;
    return (
      <>
        <JobLeadDesignRequestFooter
          canEdit={canEdit}
          canSubmit={canSubmit}
          canView={canView}
          isLoading={isLoading}
          isTiling={isTiling}
          oneCallActive={oneCallActive}
          oneCallDate={oneCallDate}
          status={null}
          onLogs={onLogs}
          onOneCall={onOneCall}
          onOpenNotes={onOpenNotes}
          onOpenPanel={handleOpenPanel}
        />
        <DesignRequestSidePanel />
      </>
    );
  }

  return (
    <>
      <JobLeadDesignRequestFooter
        canEdit={canEdit}
        canSubmit={canSubmit}
        canView={canView}
        isLoading={isLoading}
        isTiling={isTiling}
        oneCallActive={oneCallActive}
        oneCallDate={oneCallDate}
        status={statusItem?.status ?? null}
        onLogs={onLogs}
        onOneCall={onOneCall}
        onOpenNotes={onOpenNotes}
        onOpenPanel={handleOpenPanel}
      />
      <DesignRequestSidePanel />
    </>
  );
}
