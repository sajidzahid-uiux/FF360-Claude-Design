"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";

import { DetailFormSection, DetailViewPage } from "@/shared/ui/common";

export interface ActivityLogSubpageLayoutProps {
  backLabel: string;
  badge: string;
  children: ReactNode;
  detailHref: string;
  detailButtonLabel: string;
  meta?: ReactNode;
  subtitle: string;
  toolbar?: ReactNode;
}

export function ActivityLogSubpageLayout({
  backLabel,
  badge,
  children,
  detailHref,
  detailButtonLabel,
  meta,
  subtitle,
  toolbar,
}: ActivityLogSubpageLayoutProps) {
  const router = useRouter();

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
      <span className="bg-accent/15 text-accent border-accent/30 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
        {badge}
      </span>
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
