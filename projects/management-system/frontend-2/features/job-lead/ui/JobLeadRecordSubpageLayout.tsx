"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";

import type { JobLeadEntityType } from "@/constants";
import { useCmsJobLeadDetailBreadcrumb } from "@/features/job-lead/hooks/useCmsJobLeadDetailBreadcrumb";
import { DetailFormSection, DetailViewPage } from "@/shared/ui/common";

function RecordTypeBadge({ label }: { label: string }) {
  return (
    <span className="bg-accent/15 text-accent border-accent/30 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
      {label}
    </span>
  );
}

export interface JobLeadRecordSubpageLayoutProps {
  backLabel: string;
  badge: string;
  breadcrumbLabel: string | undefined;
  children: ReactNode;
  detailHref: string;
  detailButtonLabel: string;
  detailSegment: string;
  entity: JobLeadEntityType;
  meta?: ReactNode;
  recordId: string;
  subtitle: string;
  toolbar?: ReactNode;
}

export function JobLeadRecordSubpageLayout({
  backLabel,
  badge,
  breadcrumbLabel,
  children,
  detailHref,
  detailButtonLabel,
  detailSegment,
  entity,
  meta,
  recordId,
  subtitle,
  toolbar,
}: JobLeadRecordSubpageLayoutProps) {
  const router = useRouter();

  useCmsJobLeadDetailBreadcrumb(
    breadcrumbLabel,
    entity,
    detailSegment,
    recordId
  );

  const headerActions = (
    <>
      {toolbar}
      <Button
        aria-label={detailButtonLabel}
        title={detailButtonLabel}
        variant={ButtonVariantEnum.SURFACE}
        onClick={() => router.push(detailHref)}
      />
    </>
  );

  const headerMeta = (
    <>
      <RecordTypeBadge label={badge} />
      {meta}
    </>
  );

  return (
    <div className="bg-bg-app flex h-full min-h-0 flex-1 flex-col">
      <DetailViewPage
        actions={headerActions}
        backLabel={backLabel}
        bodyClassName="pb-10"
        className="flex-1"
        meta={headerMeta}
        subtitle={subtitle}
        onBack={() => router.push(detailHref)}
      >
        <DetailFormSection
          description="Who changed what and when."
          title="Activity log"
        >
          {children}
        </DetailFormSection>
      </DetailViewPage>
    </div>
  );
}
