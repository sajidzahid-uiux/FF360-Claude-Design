"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { clsx } from "clsx";
import { Bell, HelpCircle, Map, MessageSquare } from "lucide-react";

import {
  getNotificationPriorityBadgeClass,
  getNotificationPriorityBorderClass,
  getNotificationPriorityTitleClass,
} from "@/api/types";
import { HelpSupportDropdown } from "@/features/help-center";
import { formatNotificationDate } from "@/features/notification/utils/notificationDateUtils";
import { notificationTargetHref } from "@/features/notification/utils/notificationNavigation";
import { useNewNotifications } from "@/hooks/queries";
import { useDebounceNavigation } from "@/hooks/useDebounceNavigation";
import { useRouteIds } from "@/hooks/useRouteIds";
import { useUnseenChatTotal } from "@/hooks/useUnseenChatTotal";
import { APP_ROUTES, orgRoute } from "@/shared/config/routes";
import { AccentCountBadge } from "@/shared/ui/layout/AccentCountBadge";
import { CmsGlobalAddButton } from "@/shared/ui/layout/CmsGlobalAddButton";
import { CmsGlobalSearch } from "@/shared/ui/layout/CmsGlobalSearch";
import { CmsVersionSwitcherButton } from "@/shared/ui/layout/CmsVersionSwitcherButton";
import { ThemeControlsPopover } from "@/shared/ui/theme/ThemeControlsPopover";
import { Badge } from "@/shared/ui/primitives";

type CmsAppTopBarActionsSection = "trailing" | "mobile-shell";

interface CmsAppTopBarActionsProps {
  section: CmsAppTopBarActionsSection;
  unseenTotal: number;
}

function CmsAppTopBarActions({
  section,
  unseenTotal,
}: CmsAppTopBarActionsProps) {
  const isMobileShell = section === "mobile-shell";
  const showTrailing = section === "trailing" || isMobileShell;
  const { orgId } = useRouteIds();
  const { data: unreadData } = useNewNotifications({
    unread: true,
    page: 1,
    page_size: 5,
  });
  const unreadCount = unreadData?.totalCount ?? 0;
  const recentUnread = unreadData?.items ?? [];
  const { navigateTo } = useDebounceNavigation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLButtonElement>(null);
  const helpDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }

    return undefined;
  }, [showNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        helpDropdownRef.current &&
        !helpDropdownRef.current.contains(event.target as Node) &&
        helpRef.current &&
        !helpRef.current.contains(event.target as Node)
      ) {
        setShowHelp(false);
      }
    }

    if (showHelp) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }

    return undefined;
  }, [showHelp]);

  const notificationsPanelClass = isMobileShell
    ? "bg-bg-surface-elevated border-border-subtle absolute right-0 z-50 mt-2 max-h-[70vh] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border shadow-lg"
    : "bg-bg-surface-elevated border-border-subtle absolute right-0 z-50 mt-2 w-80 rounded-lg border shadow-lg";

  const chatButton = (
    <div className="relative">
      <Button
        iconOnly
        aria-label="Messages"
        leftIcon={<MessageSquare className="h-5 w-5" />}
        size={ComponentSizeEnum.MD}
        variant={ButtonVariantEnum.GHOST}
        onClick={() => navigateTo(orgRoute(orgId, APP_ROUTES.messages))}
      />
      <AccentCountBadge
        className="absolute -top-1 -right-1"
        count={unseenTotal}
        size="md"
      />
    </div>
  );

  const trailingActions = showTrailing ? (
    <>
      <CmsGlobalSearch />

      <CmsGlobalAddButton />

      <CmsVersionSwitcherButton frontendId="v2" />

      <Button
        iconOnly
        aria-label="Map"
        leftIcon={<Map className="h-5 w-5" />}
        size={ComponentSizeEnum.MD}
        variant={ButtonVariantEnum.GHOST}
        onClick={() => navigateTo(orgRoute(orgId, APP_ROUTES.map))}
      />

      {chatButton}

      <div className="relative">
        <Button
          ref={bellRef}
          iconOnly
          aria-label="Notifications"
          className={showNotifications ? "" : undefined}
          leftIcon={<Bell className="h-5 w-5" />}
          size={ComponentSizeEnum.MD}
          variant={ButtonVariantEnum.GHOST}
          onClick={() => setShowNotifications((value) => !value)}
        />
        <AccentCountBadge
          className="absolute -top-1 -right-1"
          count={unreadCount}
          size="md"
        />
        {showNotifications ? (
          <div ref={notificationsRef} className={notificationsPanelClass}>
            <div className="border-border-subtle flex items-center justify-between border-b px-4 py-2">
              <span className="font-semibold">Notifications</span>
              {unreadCount > 0 ? (
                <span className="bg-bg-app rounded-full px-2 py-1 text-xs font-medium">
                  {unreadCount} New
                </span>
              ) : null}
            </div>
            <div className="divide-border max-h-80 divide-y overflow-y-auto">
              {recentUnread.length === 0 ? (
                <p className="text-text-muted py-8 text-center">
                  No unread notifications
                </p>
              ) : null}
              {recentUnread.map((notification) => {
                const href = orgId
                  ? notificationTargetHref(notification.web_url, orgId)
                  : null;
                const rowClass = clsx(
                  "flex items-start gap-2 px-4 py-3 transition",
                  getNotificationPriorityBorderClass(notification.category),
                  href
                    ? "hover:bg-bg-surface cursor-pointer"
                    : "hover:bg-bg-surface"
                );
                const inner = (
                  <>
                    <div className="min-w-0 flex-1">
                      <div
                        className={clsx(
                          "truncate text-sm font-medium",
                          getNotificationPriorityTitleClass(
                            notification.category
                          )
                        )}
                      >
                        {notification.title}
                      </div>
                      {notification.description ? (
                        <div className="text-text-muted mt-1 text-xs">
                          {notification.description}
                        </div>
                      ) : null}
                      <div className="text-text-muted mt-1 text-xs">
                        {notification.created_at
                          ? formatNotificationDate(notification.created_at)
                          : ""}
                      </div>
                    </div>
                    {notification.module ? (
                      <Badge
                        className={clsx(
                          "shrink-0 px-1.5 py-0.5 text-[10px] leading-tight",
                          getNotificationPriorityBadgeClass(
                            notification.category
                          )
                        )}
                      >
                        {notification.module}
                      </Badge>
                    ) : null}
                  </>
                );

                return href ? (
                  <Link
                    key={notification.id}
                    className={rowClass}
                    href={href}
                    onClick={() => setShowNotifications(false)}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={notification.id} className={rowClass}>
                    {inner}
                  </div>
                );
              })}
            </div>
            <div className="border-border-subtle border-t">
              <Link
                className="text-accent block py-3 text-center font-semibold hover:underline"
                href={
                  orgId
                    ? orgRoute(orgId, APP_ROUTES.userNotifications)
                    : "/user/notifications"
                }
              >
                View All Notifications
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <Button
          ref={helpRef}
          iconOnly
          aria-expanded={showHelp}
          aria-haspopup="menu"
          aria-label="Help"
          className={showHelp ? "" : undefined}
          leftIcon={<HelpCircle className="h-5 w-5" />}
          size={ComponentSizeEnum.MD}
          variant={ButtonVariantEnum.GHOST}
          onClick={() => setShowHelp((value) => !value)}
        />
        {showHelp ? (
          <HelpSupportDropdown dropdownRef={helpDropdownRef} />
        ) : null}
      </div>
    </>
  ) : null;

  if (isMobileShell) {
    return (
      <div className="flex shrink-0 items-center gap-1">{trailingActions}</div>
    );
  }

  return <div className="flex items-center gap-2">{trailingActions}</div>;
}

/** Trailing actions for `FieldFlowAppLayout` mobile shell bar. */
export function CmsAppTopBarMobileShellActions() {
  const unseenTotal = useUnseenChatTotal();

  return (
    <CmsAppTopBarActions section="mobile-shell" unseenTotal={unseenTotal} />
  );
}

export function CmsAppTopBar() {
  const unseenTotal = useUnseenChatTotal();

  return (
    <div className="flex w-full items-center gap-3">
      <ThemeControlsPopover align="left" />
      <div className="flex-1" />
      <CmsAppTopBarActions section="trailing" unseenTotal={unseenTotal} />
    </div>
  );
}
