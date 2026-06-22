"use client";

import Link from "next/link";
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { FieldFlowSidebarGroup } from "@fieldflow360/org-ui";
import { NavExpandableMenuItem, NavGroupLink } from "@fieldflow360/org-ui";
import { useQueryClient } from "@tanstack/react-query";

import {
  type ActiveEquipmentCounts,
  hasActiveMaintenanceCounts,
} from "@/api/types/maintenance";
import { prefetchAllEquipment } from "@/hooks/queries";

import { CmsSidebarNavBadge } from "./CmsSidebarNavBadge";
import { MaintenanceIndicators } from "./MaintenanceIndicators";
import type { CmsSidebarLink } from "./cmsNavigation";
import {
  collectExpandableParentIds,
  isNavItemActive,
  isPathActive,
  resolveNavHref,
} from "./cmsSidebarNavUtils";

const CMS_SIDEBAR_SCROLL_STORAGE_KEY = "cms-sidebar-scroll-top";

interface CmsAppSidebarNavProps {
  pathname: string | null;
  organizationId: string | null;
  navigation: FieldFlowSidebarGroup[];
  linkBadgeCounts?: Record<string, number>;
  maintenanceCounts?: ActiveEquipmentCounts | null;
  isCollapsed: boolean;
  onNavigate?: () => void;
  onRequestExpand?: () => void;
}

type CmsSidebarLinkComponent = NonNullable<
  ComponentProps<typeof NavGroupLink>["linkComponent"]
>;

function createLinkComponent(
  organizationId: string | null,
  onNavigate?: () => void,
  onPersistScroll?: () => void,
  prefetchEquipment?: (orgId: string) => void
): CmsSidebarLinkComponent {
  return function CmsSidebarLink(props) {
    const isEquipmentRoute = props.href.includes("/equipment");

    return (
      <Link
        className={props.className}
        href={props.href}
        prefetch={false}
        style={props.style}
        title={props.title}
        onClick={(event) => {
          onPersistScroll?.();
          props.onClick?.(event);
          onNavigate?.();
        }}
        onMouseEnter={() => {
          if (isEquipmentRoute && organizationId) {
            prefetchEquipment?.(organizationId);
          }
        }}
      >
        {props.children}
      </Link>
    );
  };
}

function renderNavLinks({
  links,
  pathname,
  organizationId,
  linkBadgeCounts,
  maintenanceCounts,
  isCollapsed,
  expandedIds,
  onExpandableChange,
  linkComponent,
  onNavigate,
  onPersistScroll,
}: {
  links: CmsSidebarLink[];
  pathname: string | null;
  organizationId: string | null;
  linkBadgeCounts: Record<string, number>;
  maintenanceCounts?: ActiveEquipmentCounts | null;
  isCollapsed: boolean;
  expandedIds: Set<string>;
  onExpandableChange: (
    linkId: string,
    siblingExpandableIds: string[],
    expanded: boolean
  ) => void;
  linkComponent: CmsSidebarLinkComponent;
  onNavigate?: () => void;
  onPersistScroll?: () => void;
}): ReactNode {
  const siblingExpandableIds = links
    .filter((item) => item.children?.length)
    .map((item) => item.id);

  return links.map((link) => {
    const children = link.children ?? [];
    const hasChildren = children.length > 0;

    if (hasChildren) {
      const navHref = resolveNavHref(link.href, organizationId);
      const isParentActive = isNavItemActive(
        pathname,
        navHref,
        children,
        organizationId
      );

      return (
        <NavExpandableMenuItem
          key={link.id}
          expandWhenChildActive={false}
          icon={link.icon}
          id={link.id}
          isActive={isParentActive}
          isCollapsed={isCollapsed}
          isExpanded={expandedIds.has(link.id)}
          items={children.map((child) => {
            const childHref = resolveNavHref(child.href, organizationId);
            return {
              id: child.id,
              href: childHref,
              title: child.title,
              icon: child.icon,
              isActive: isPathActive(pathname, childHref),
              onClick: () => {
                onPersistScroll?.();
                onNavigate?.();
              },
            };
          })}
          linkComponent={linkComponent}
          title={link.title}
          onExpandedChange={(expanded) =>
            onExpandableChange(link.id, siblingExpandableIds, expanded)
          }
        />
      );
    }

    const navHref = resolveNavHref(link.href, organizationId);
    const isActive = isNavItemActive(
      pathname,
      navHref,
      undefined,
      organizationId
    );

    const badgeCount = link.badgeCount ?? linkBadgeCounts[link.id] ?? 0;
    const linkLabel =
      typeof link.title === "string" ? link.title : String(link.title);
    const hasMaintenanceIndicators =
      link.id === "maintenance" &&
      maintenanceCounts != null &&
      hasActiveMaintenanceCounts(maintenanceCounts);

    const maintenanceIndicators = hasMaintenanceIndicators ? (
      <MaintenanceIndicators counts={maintenanceCounts} />
    ) : null;

    const tooltipTitle =
      badgeCount > 0 ? `${linkLabel} (${badgeCount} pending)` : linkLabel;

    const title =
      !isCollapsed && badgeCount > 0 ? (
        <span className="flex w-full min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 truncate leading-5">
            {link.title}
          </span>
          <CmsSidebarNavBadge
            count={badgeCount}
            title={`${badgeCount} pending`}
          />
        </span>
      ) : (
        link.title
      );

    if (!isCollapsed && maintenanceIndicators) {
      return (
        <div key={link.id} className="relative">
          <NavGroupLink
            className="w-full"
            href={navHref}
            icon={link.icon}
            isActive={isActive}
            isCollapsed={isCollapsed}
            linkComponent={linkComponent}
            title={
              <span className="block truncate pr-[4.75rem] leading-5">
                {link.title}
              </span>
            }
            tooltipTitle={linkLabel}
          />
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <div className="pointer-events-auto">{maintenanceIndicators}</div>
          </div>
        </div>
      );
    }

    return (
      <NavGroupLink
        key={link.id}
        className={!isCollapsed ? "w-full" : undefined}
        href={navHref}
        icon={link.icon}
        isActive={isActive}
        isCollapsed={isCollapsed}
        linkComponent={linkComponent}
        title={title}
        tooltipTitle={tooltipTitle}
      />
    );
  });
}

export function CmsAppSidebarNav({
  pathname,
  organizationId,
  navigation,
  linkBadgeCounts = {},
  maintenanceCounts = null,
  isCollapsed,
  onNavigate,
  onRequestExpand,
}: CmsAppSidebarNavProps) {
  const queryClient = useQueryClient();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const prefetchEquipmentList = useCallback(
    (orgId: string) => {
      void prefetchAllEquipment(queryClient, orgId);
    },
    [queryClient]
  );

  const persistScrollPosition = useCallback(() => {
    const top = scrollContainerRef.current?.scrollTop ?? 0;
    window.sessionStorage.setItem(CMS_SIDEBAR_SCROLL_STORAGE_KEY, String(top));
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const saved = Number.parseInt(
      window.sessionStorage.getItem(CMS_SIDEBAR_SCROLL_STORAGE_KEY) ?? "0",
      10
    );
    if (!Number.isNaN(saved) && saved > 0) {
      container.scrollTop = saved;
    }
  }, []);

  const linkComponent = createLinkComponent(
    organizationId,
    onNavigate,
    persistScrollPosition,
    prefetchEquipmentList
  );

  useEffect(() => {
    const autoExpandIds: string[] = [];
    for (const group of navigation) {
      autoExpandIds.push(
        ...collectExpandableParentIds(group.links, pathname, organizationId)
      );
    }
    if (autoExpandIds.length === 0) return;

    // Keep a single open group when route matches multiple (prefer last match).
    const activeId = autoExpandIds[autoExpandIds.length - 1];
    setExpandedIds(new Set([activeId]));
  }, [navigation, organizationId, pathname]);

  const handleExpandableChange = useCallback(
    (linkId: string, siblingExpandableIds: string[], expanded: boolean) => {
      if (isCollapsed) {
        if (expanded) {
          setExpandedIds(new Set([linkId]));
          onRequestExpand?.();
        }
        return;
      }

      setExpandedIds((prev) => {
        if (!expanded) {
          const next = new Set(prev);
          next.delete(linkId);
          return next;
        }

        // One expandable group at a time (Leads or Jobs), same as org-ui dev sidebar.
        const next = new Set<string>();
        if (siblingExpandableIds.includes(linkId)) {
          next.add(linkId);
        }
        return next;
      });
    },
    [isCollapsed, onRequestExpand]
  );

  const toolsGroup = navigation.find((group) => group.id === "tools");
  const mainGroups = navigation.filter((group) => group.id !== "tools");

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollContainerRef}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
        onScroll={persistScrollPosition}
      >
        {mainGroups.map((group) => (
          <div
            key={group.id}
            className="border-border-subtle/60 border-b p-2 last:border-b-0"
          >
            {!isCollapsed && group.title ? (
              <span className="text-text-muted flex h-[32px] items-center px-2 text-xs font-[500]">
                {group.title}
              </span>
            ) : null}
            <div className="space-y-1">
              {renderNavLinks({
                links: group.links as CmsSidebarLink[],
                pathname,
                organizationId,
                linkBadgeCounts,
                maintenanceCounts,
                isCollapsed,
                expandedIds,
                onExpandableChange: handleExpandableChange,
                linkComponent,
                onNavigate,
                onPersistScroll: persistScrollPosition,
              })}
            </div>
          </div>
        ))}
      </div>
      {toolsGroup ? (
        <div className="border-border-subtle/60 shrink-0 border-t p-2">
          {!isCollapsed && toolsGroup.title ? (
            <span className="text-text-muted flex h-[32px] items-center px-2 text-xs font-[500]">
              {toolsGroup.title}
            </span>
          ) : null}
          <div className="space-y-1">
            {renderNavLinks({
              links: toolsGroup.links as CmsSidebarLink[],
              pathname,
              organizationId,
              linkBadgeCounts,
              maintenanceCounts,
              isCollapsed,
              expandedIds,
              onExpandableChange: handleExpandableChange,
              linkComponent,
              onNavigate,
              onPersistScroll: persistScrollPosition,
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
