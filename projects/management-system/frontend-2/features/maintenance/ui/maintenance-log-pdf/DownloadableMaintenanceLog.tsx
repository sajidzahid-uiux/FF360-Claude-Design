"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";

import type { MaintenanceLogPdfProps } from "@/features/maintenance";
import { getMaintenanceLogPdfFileName } from "@/features/maintenance/lib/maintenance-log-pdf-filename";

import { MaintenanceLogPDFDocument } from "./MaintenanceLogPDFDocument";

const downloadLinkStyle = {
  textDecoration: "none",
  padding: "10px 20px",
  color: "#fff",
  backgroundColor: "#40C351",
  borderRadius: "4px",
  fontSize: "14px",
  fontWeight: "bold",
  cursor: "pointer",
  border: "none",
  display: "inline-block",
} as const;

export function DownloadableMaintenanceLog(props: MaintenanceLogPdfProps) {
  const fileName = getMaintenanceLogPdfFileName(props.equipmentInfo.name);

  return (
    <PDFDownloadLink
      document={<MaintenanceLogPDFDocument {...props} />}
      fileName={fileName}
      style={downloadLinkStyle}
    >
      {({ loading }) =>
        loading ? "Loading document..." : "Download Maintenance Log"
      }
    </PDFDownloadLink>
  );
}
