import type { MaintenanceLogPdfItem } from "@/features/maintenance";

const BASE_ROW_HEIGHT = 45;
const PADDING_HEIGHT = 20;
const LINE_HEIGHT = 20;
const CHARACTERS_PER_LINE = 70;

const PAGE_HEIGHT = 842;
const TOP_PADDING = 32;
const BOTTOM_PADDING = 32;
const HEADER_HEIGHT = 90;
const EQUIPMENT_INFO_HEIGHT = 120;
const TABLE_HEADER_HEIGHT = 40;
const FOOTER_HEIGHT = 90;
const TABLE_MARGIN_TOP = 16;
const TABLE_BORDER = 3;
const SAFETY_MARGIN = 30;

const AVAILABLE_TABLE_HEIGHT =
  PAGE_HEIGHT -
  TOP_PADDING -
  BOTTOM_PADDING -
  HEADER_HEIGHT -
  EQUIPMENT_INFO_HEIGHT -
  TABLE_HEADER_HEIGHT -
  FOOTER_HEIGHT -
  TABLE_MARGIN_TOP -
  TABLE_BORDER -
  SAFETY_MARGIN;

function calculateRowHeight(description: string): number {
  const cleanDescription = description.replace(/_/g, " ").trim();
  const estimatedLines = Math.max(
    1,
    Math.ceil(cleanDescription.length / CHARACTERS_PER_LINE)
  );
  const textHeight = estimatedLines * LINE_HEIGHT;
  return Math.max(BASE_ROW_HEIGHT, textHeight + PADDING_HEIGHT);
}

export function splitMaintenanceLogsIntoPages(
  logs: MaintenanceLogPdfItem[]
): MaintenanceLogPdfItem[][] {
  if (!logs.length) return [[]];

  const pages: MaintenanceLogPdfItem[][] = [];
  let currentPage: MaintenanceLogPdfItem[] = [];
  let currentPageHeight = 0;

  for (const log of logs) {
    const rowHeight = calculateRowHeight(log.description);

    if (
      currentPageHeight + rowHeight > AVAILABLE_TABLE_HEIGHT &&
      currentPage.length > 0
    ) {
      pages.push(currentPage);
      currentPage = [];
      currentPageHeight = 0;
    }

    currentPage.push(log);
    currentPageHeight += rowHeight;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}
