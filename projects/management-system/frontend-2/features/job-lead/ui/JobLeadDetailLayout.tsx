"use client";

import type { ReactNode } from "react";

import {
  TabsSwitcher,
  type TabsSwitcherItem,
  TabsSwitcherViewEnum,
} from "@fieldflow360/org-ui";

import { DetailViewPage } from "@/shared/ui/common";

export interface JobLeadDetailLayoutProps<T extends string> {
  activeTab: T;
  backLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  meta?: ReactNode;
  /** Optional collapsible panel docked to the right of the body (e.g. Notes). */
  notesPanel?: ReactNode;
  onBack: () => void;
  onTabChange: (tab: T) => void;
  subtitle: string;
  tabToolbar?: ReactNode;
  tabs: readonly TabsSwitcherItem<T>[];
  toolbar?: ReactNode;
}

export function JobLeadDetailLayout<T extends string>({
  activeTab,
  backLabel,
  children,
  footer,
  meta,
  notesPanel,
  onBack,
  onTabChange,
  subtitle,
  tabToolbar,
  tabs,
  toolbar,
}: JobLeadDetailLayoutProps<T>) {
  return (
    <DetailViewPage
      actions={toolbar}
      backLabel={backLabel}
      bodyClassName="pb-10"
      className="flex-1"
      constrainBodyWidth={false}
      contentClassName="mx-auto w-full max-w-[90rem] space-y-5 pt-2"
      footer={footer}
      meta={meta}
      subtitle={subtitle}
      onBack={onBack}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TabsSwitcher
          items={[...tabs]}
          value={activeTab}
          view={TabsSwitcherViewEnum.UNDERLINED}
          onChange={onTabChange}
        />
        {tabToolbar ? (
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            {tabToolbar}
          </div>
        ) : null}
      </div>
      {notesPanel ? (
        // Standard grid utilities only — this build doesn't emit `lg:` or
        // arbitrary `grid-cols-[…]`. Main spans 2/3, Notes the right 1/3.
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 md:grid-cols-3">
          <div className="min-w-0 md:col-span-2">{children}</div>
          <aside className="min-w-0 md:col-span-1">{notesPanel}</aside>
        </div>
      ) : (
        <div className="min-w-0">{children}</div>
      )}
    </DetailViewPage>
  );
}
