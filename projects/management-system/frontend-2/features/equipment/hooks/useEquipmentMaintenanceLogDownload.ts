"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import {
  type EquipmentMaintenanceLogType,
  downloadEquipmentMaintenanceLog,
} from "@/features/equipment/lib/download-equipment-maintenance-log";
import {
  useMaintenanceByEquipment,
  useOrganizationById,
  useTeamData,
} from "@/hooks";

export interface UseEquipmentMaintenanceLogDownloadParams {
  orgId?: string | number | null;
  equipmentId: string;
  equipmentName: string;
  serialNumber?: string | null;
  equipmentType: EquipmentMaintenanceLogType;
}

export function useEquipmentMaintenanceLogDownload({
  orgId,
  equipmentId,
  equipmentName,
  serialNumber,
  equipmentType,
}: UseEquipmentMaintenanceLogDownloadParams) {
  const { data: maintenanceLogs } = useMaintenanceByEquipment(equipmentId);

  const pdfMaintenanceLogs = useMemo(
    () =>
      maintenanceLogs?.map((log) => ({
        date: log.date,
        description: log.description,
        assigned_to: log.assigned_to ?? null,
      })) ?? [],
    [maintenanceLogs]
  );
  const { data: teamMembers } = useTeamData();
  const organizationId = orgId == null ? null : String(orgId);
  const { data: organization, refetch: refetchOrganization } =
    useOrganizationById(organizationId);
  const refetchOrganizationRef = useRef(refetchOrganization);
  refetchOrganizationRef.current = refetchOrganization;

  const [isDownloading, setIsDownloading] = useState(false);

  const isLogReady = useMemo(
    () =>
      Boolean(
        maintenanceLogs &&
        maintenanceLogs.length > 0 &&
        teamMembers &&
        teamMembers.length > 0
      ),
    [maintenanceLogs, teamMembers]
  );

  const downloadMaintenanceLog = useCallback(async () => {
    if (!pdfMaintenanceLogs.length || !teamMembers?.length || isDownloading) {
      return;
    }

    setIsDownloading(true);
    try {
      await downloadEquipmentMaintenanceLog({
        equipmentName,
        serialNumber,
        equipmentType,
        maintenanceLogs: pdfMaintenanceLogs,
        teamMembers,
        organization,
        refetchOrganization: () => refetchOrganizationRef.current(),
      });
    } catch (error) {
      console.error("Error generating maintenance log PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [
    equipmentName,
    equipmentType,
    isDownloading,
    pdfMaintenanceLogs,
    organization,
    serialNumber,
    teamMembers,
  ]);

  return { isLogReady, isDownloading, downloadMaintenanceLog };
}
