"use client";

import { TouchSlideText } from "@/shared/ui/common";

export function JobEquipmentTruncatedName({
  machineName,
  serialNumber,
  maxChars = 40,
}: {
  machineName: string;
  serialNumber?: string;
  maxChars?: number;
}) {
  const displayText = serialNumber
    ? `${machineName} - ${serialNumber}`
    : machineName;

  if (!machineName) {
    return <span>Unknown equipment</span>;
  }

  if (displayText.length <= maxChars) {
    return <span>{displayText}</span>;
  }

  return (
    <TouchSlideText
      maxWidth="max-w-[123px] sm:max-w-[333px]"
      text={displayText}
    />
  );
}
