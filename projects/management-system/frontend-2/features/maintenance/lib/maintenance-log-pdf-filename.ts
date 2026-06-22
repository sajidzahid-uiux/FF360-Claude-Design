export function getMaintenanceLogPdfFileName(equipmentName: string): string {
  return `${equipmentName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-maintenance-log.pdf`;
}
