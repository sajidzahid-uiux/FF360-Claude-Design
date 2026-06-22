"use client";

import type { ReactNode } from "react";

import { ContactNumberRow } from "@/features/contacts";
import { JobLeadProgressMeta } from "@/features/job-lead";

import { DocumentSentToggleButtons } from "./DocumentSentToggleButtons";

export interface ShowMoreCardDetailMetaProps {
  badgeLabel: string;
  contactInfo?: Parameters<typeof ContactNumberRow>[0]["contactInfo"];
  poNumber?: string | null;
  progressBar?: string | number | null;
  contractSent?: boolean;
  estimateSent?: boolean;
  trailing?: ReactNode;
}

export function ShowMoreCardDetailMeta({
  badgeLabel,
  contactInfo,
  poNumber,
  progressBar,
  contractSent = false,
  estimateSent = false,
  trailing,
}: ShowMoreCardDetailMetaProps) {
  return (
    <>
      <span className="bg-accent/15 text-accent border-accent/30 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
        {badgeLabel}
      </span>
      <ContactNumberRow contactInfo={contactInfo} number={poNumber} />
      <JobLeadProgressMeta progressBar={progressBar} />
      <DocumentSentToggleButtons
        contractSent={contractSent}
        estimateSent={estimateSent}
      />
      {trailing}
    </>
  );
}
