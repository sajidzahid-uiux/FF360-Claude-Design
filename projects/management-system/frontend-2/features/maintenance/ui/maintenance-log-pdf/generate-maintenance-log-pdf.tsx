import { pdf } from "@react-pdf/renderer";

import type { MaintenanceLogPdfProps } from "@/features/maintenance";

import { MaintenanceLogPDFDocument } from "./MaintenanceLogPDFDocument";

export async function generateMaintenanceLogPDF(
  props: MaintenanceLogPdfProps
): Promise<Blob> {
  await new Promise<void>((resolve) => {
    queueMicrotask(() => resolve());
  });

  return pdf(<MaintenanceLogPDFDocument {...props} />).toBlob();
}
