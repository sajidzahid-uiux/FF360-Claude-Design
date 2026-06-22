import type { TeamMember } from "@/api/types";
import {
  flattenMaintenanceLogs,
  generateMaintenanceLogPDF,
  getMaintenanceLogPdfFileName,
} from "@/features/maintenance";

export type EquipmentMaintenanceLogType = "Vehicle" | "Machine" | "Trailer";

type MaintenanceLogInput = Parameters<typeof flattenMaintenanceLogs>[0];

interface OrganizationPdfSource {
  name?: string;
  email?: string;
  logo?: string | null;
}

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

async function resolveOrganizationForPdf(
  cachedOrganization: OrganizationPdfSource | undefined,
  refetchOrganization?: () => Promise<{ data?: OrganizationPdfSource }>
): Promise<OrganizationPdfSource | undefined> {
  if (cachedOrganization?.logo) {
    return cachedOrganization;
  }

  if (!refetchOrganization) {
    return cachedOrganization;
  }

  try {
    const result = await refetchOrganization();
    return result.data ?? cachedOrganization;
  } catch {
    return cachedOrganization;
  }
}

export interface DownloadEquipmentMaintenanceLogParams {
  equipmentName: string;
  serialNumber?: string | null;
  equipmentType: EquipmentMaintenanceLogType;
  maintenanceLogs: MaintenanceLogInput;
  teamMembers: TeamMember[];
  organization?: OrganizationPdfSource;
  refetchOrganization?: () => Promise<{ data?: OrganizationPdfSource }>;
}

export async function downloadEquipmentMaintenanceLog({
  equipmentName,
  serialNumber,
  equipmentType,
  maintenanceLogs,
  teamMembers,
  organization,
  refetchOrganization,
}: DownloadEquipmentMaintenanceLogParams): Promise<void> {
  const freshOrgData = await resolveOrganizationForPdf(
    organization,
    refetchOrganization
  );

  const pdfProps = {
    equipmentInfo: {
      name: equipmentName || "Unknown",
      serial_number: serialNumber || "N/A",
      equipment_type: equipmentType,
    },
    maintenanceLogs: flattenMaintenanceLogs(maintenanceLogs ?? []),
    teamData: teamMembers,
    companyInfo: {
      name: freshOrgData?.name || "FieldFlow360",
      email: freshOrgData?.email || "support@fieldflow360.com",
      logo: freshOrgData?.logo ? await urlToBase64(freshOrgData.logo) : null,
    },
  };

  const blob = await generateMaintenanceLogPDF(pdfProps);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getMaintenanceLogPdfFileName(pdfProps.equipmentInfo.name);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
