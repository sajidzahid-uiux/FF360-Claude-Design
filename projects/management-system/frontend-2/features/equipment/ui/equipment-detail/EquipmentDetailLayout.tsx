"use client";

import type { ReactNode } from "react";

import {
  TabsSwitcher,
  type TabsSwitcherItem,
  TabsSwitcherViewEnum,
} from "@fieldflow360/org-ui";

import { DetailViewPage } from "@/shared/ui/common";

export interface EquipmentDetailLayoutProps<T extends string> {
  backLabel: string;
  onBack: () => void;
  subtitle?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  tabs: readonly TabsSwitcherItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  children: ReactNode;
}

export function EquipmentDetailLayout<T extends string>({
  backLabel,
  onBack,
  subtitle,
  meta,
  actions,
  footer,
  tabs,
  activeTab,
  onTabChange,
  children,
}: EquipmentDetailLayoutProps<T>) {
  return (
    <DetailViewPage
      actions={actions}
      backLabel={backLabel}
      bodyClassName="px-4 sm:px-6"
      className="flex-1"
      footer={footer}
      meta={meta}
      subtitle={subtitle}
      onBack={onBack}
    >
      <TabsSwitcher
        items={[...tabs]}
        value={activeTab}
        view={TabsSwitcherViewEnum.UNDERLINED}
        onChange={onTabChange}
      />
      <div className="min-w-0">{children}</div>
    </DetailViewPage>
  );
}
