"use client";

import type { ReactNode } from "react";

import { DetailFormSection } from "@/shared/ui/common";

export interface JobOnSiteEquipmentSectionProps {
  children: ReactNode;
  description?: string;
  title?: string;
}

export function JobOnSiteEquipmentSection({
  children,
  description = "Assigned equipment and hour readings for this job.",
  title = "Equipment assignment",
}: JobOnSiteEquipmentSectionProps) {
  return (
    <DetailFormSection description={description} title={title}>
      {children}
    </DetailFormSection>
  );
}
