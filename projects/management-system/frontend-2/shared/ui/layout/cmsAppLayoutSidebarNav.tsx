"use client";

import { usePathname } from "next/navigation";
import {
  type ReactNode,
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
} from "react";

import type {
  FieldFlowSidebarGroup,
  FieldFlowSidebarNavRenderArgs,
} from "@fieldflow360/org-ui";

import { useIsAdmin, useQuickActions } from "@/hooks/queries";
import { useActiveEquipmentCounts } from "@/hooks/useActiveEquipmentCounts";

import { CmsAppSidebarNav } from "./CmsAppSidebarNav";

export type CmsAppLayoutSidebarNavContextValue = {
  organizationId: string | null;
  navigation: FieldFlowSidebarGroup[];
  linkBadgeCounts?: Record<string, number>;
  onCollapsedChange: (collapsed: boolean) => void;
  setCollapseController: (controller: (collapsed: boolean) => void) => void;
};

const CmsAppLayoutSidebarNavContext =
  createContext<CmsAppLayoutSidebarNavContextValue | null>(null);

export function CmsAppLayoutSidebarNavProvider({
  value,
  children,
}: {
  value: CmsAppLayoutSidebarNavContextValue;
  children: ReactNode;
}) {
  return (
    <CmsAppLayoutSidebarNavContext.Provider value={value}>
      {children}
    </CmsAppLayoutSidebarNavContext.Provider>
  );
}

function SidebarNavSlot({
  args,
  pathname,
  organizationId,
  navigation,
  linkBadgeCounts,
  onCollapsedChange,
  setCollapseController,
}: CmsAppLayoutSidebarNavContextValue & {
  args: FieldFlowSidebarNavRenderArgs;
  pathname: string;
}) {
  const isAdmin = useIsAdmin();
  const { quickActionCount } = useQuickActions({}, isAdmin);
  const { data: maintenanceCounts } = useActiveEquipmentCounts();

  const mergedLinkBadgeCounts = useMemo(() => {
    if (!isAdmin || quickActionCount <= 0) {
      return linkBadgeCounts;
    }

    return {
      ...linkBadgeCounts,
      "quick-actions": quickActionCount,
    };
  }, [isAdmin, linkBadgeCounts, quickActionCount]);

  useLayoutEffect(() => {
    onCollapsedChange(args.isCollapsed);
    setCollapseController(args.setCollapsed);
  }, [
    args.isCollapsed,
    args.setCollapsed,
    onCollapsedChange,
    setCollapseController,
  ]);

  return (
    <CmsAppSidebarNav
      isCollapsed={args.isCollapsed}
      linkBadgeCounts={mergedLinkBadgeCounts}
      maintenanceCounts={maintenanceCounts ?? null}
      navigation={navigation}
      organizationId={organizationId}
      pathname={pathname}
      onNavigate={args.isMobile ? args.closeMobileSidebar : undefined}
      onRequestExpand={() => args.setCollapsed(false)}
    />
  );
}

function CmsAppLayoutSidebarNavBridge({
  args,
}: {
  args: FieldFlowSidebarNavRenderArgs;
}) {
  const pathname = usePathname() ?? "";
  const ctx = useContext(CmsAppLayoutSidebarNavContext);
  if (!ctx) return null;

  return <SidebarNavSlot args={args} pathname={pathname} {...ctx} />;
}

export function renderCmsAppLayoutSidebarNav(
  args: FieldFlowSidebarNavRenderArgs
) {
  return <CmsAppLayoutSidebarNavBridge args={args} />;
}

/** @deprecated Use {@link CmsAppLayoutSidebarNavProvider} instead. */
export const cmsAppLayoutSidebarNavContext: {
  current: CmsAppLayoutSidebarNavContextValue | null;
} = { current: null };

export type CmsAppLayoutSidebarNavContext = CmsAppLayoutSidebarNavContextValue;
