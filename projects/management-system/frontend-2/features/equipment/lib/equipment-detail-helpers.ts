import type { ImageValue } from "@/features/equipment/model/show-more-card";

export function isPdfFile(file: File | string | null | undefined): boolean {
  if (!file) return false;
  if (file instanceof File) {
    return (
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf")
    );
  }
  if (typeof file === "string") {
    return (
      file.toLowerCase().includes(".pdf") || file.toLowerCase().endsWith(".pdf")
    );
  }
  return false;
}

export function isPdfUrl(urlOrName: string | null | undefined): boolean {
  return !!urlOrName && /\.pdf($|\?)/i.test(urlOrName);
}

export function getEquipmentImageUrl(image: ImageValue): string | null {
  if (!image) return null;
  if (isPdfFile(image)) return null;
  if (typeof image === "string") return image;
  if (image instanceof File) return URL.createObjectURL(image);
  return null;
}

export function formatEquipmentLastUpdated(
  lastUpdated: string | null | undefined
): string | null {
  if (!lastUpdated) return null;
  try {
    const date = new Date(lastUpdated);
    return isNaN(date.getTime()) ? lastUpdated : date.toLocaleDateString();
  } catch {
    return lastUpdated;
  }
}

export function getEquipmentServiceStatusDisplay(
  serviceStatus: string | undefined
): {
  statusText: string;
  statusColor: string;
} {
  const isAvailable = serviceStatus === "A";
  return {
    statusText: isAvailable ? "Available" : "Unavailable",
    statusColor: isAvailable ? "#008000" : "#FF0000",
  };
}

export interface CommonSpecValidationRules {
  makeValue: string;
  modelValue?: string;
  colorValue?: string;
  yearValue?: string | number | null;
  serialNumberValue?: string | null;
  serialNumberMaxLength?: number;
  serialNumberLabel?: string;
  licensePlateValue?: string;
}

export function validateCommonEquipmentSpecFields(
  rules: CommonSpecValidationRules
): string | null {
  const {
    makeValue,
    modelValue = "",
    colorValue = "",
    yearValue,
    serialNumberValue,
    serialNumberMaxLength = 50,
    serialNumberLabel = "Serial number",
    licensePlateValue,
  } = rules;

  if (!makeValue.trim()) return "Make is required";
  if (makeValue.trim().length > 100) return "Make cannot exceed 100 characters";
  if (modelValue && modelValue.trim().length > 100) {
    return "Model cannot exceed 100 characters";
  }
  if (colorValue && colorValue.trim().length > 50) {
    return "Color cannot exceed 50 characters";
  }
  if (yearValue !== undefined && yearValue !== null && yearValue !== "") {
    const yearNum = Number(yearValue);
    if (isNaN(yearNum) || yearNum < 1900) return "Year must be at least 1900";
    const maxYear = new Date().getFullYear() + 1;
    if (yearNum > maxYear) return `Year cannot exceed ${maxYear}`;
  }
  if (serialNumberValue && serialNumberValue.length > serialNumberMaxLength) {
    return `${serialNumberLabel} cannot exceed ${serialNumberMaxLength} characters`;
  }
  if (licensePlateValue && licensePlateValue.length > 40) {
    return "License plate cannot exceed 40 characters";
  }
  return null;
}
