"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SYSTEM_SETTINGS_PIN_CATEGORIES_TAB_PARAM } from "@/features/pin-categories/lib/systemSettingsNavigation";
import { PinCategoriesSettings } from "@/features/pin-categories/ui/PinCategoriesSettings";
import {
  SystemSettingsBreadcrumbToolbar,
  type SystemSettingsTab,
} from "@/features/system-settings/ui/SystemSettingsBreadcrumbToolbar";
import { SystemSettingsView } from "@/features/system-settings/ui/SystemSettingsView";
import { useRoutePermissions } from "@/hooks/permissions";
import { APP_ROUTE_LABELS } from "@/shared/config/routes";
import { PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";

function resolveSettingsTabFromParam(
  tabParam: string | null
): SystemSettingsTab {
  if (tabParam === SYSTEM_SETTINGS_PIN_CATEGORIES_TAB_PARAM) {
    return "pin-categories";
  }
  return "equipment";
}

export default function SystemSettingsPage() {
  const { read: canViewSettings, write: canEditSettings } =
    useRoutePermissions() || {};
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [settingsTab, setSettingsTab] = useState<SystemSettingsTab>(() =>
    resolveSettingsTabFromParam(tabParam)
  );

  useEffect(() => {
    setSettingsTab(resolveSettingsTabFromParam(tabParam));
  }, [tabParam]);

  return (
    <PageRenderer
      renderChildrenWhenEmpty
      data={[{}]}
      description="Configure equipment maintenance, archiving, and pin category settings for your organization"
      emptyState={{
        title: "No settings data",
        description: "Settings information will appear here.",
      }}
      error={null}
      isLoading={false}
      loadingMessage="Loading settings..."
      title={APP_ROUTE_LABELS.systemSettings}
    >
      {() => {
        if (!canViewSettings) {
          return <AccessDeniedView />;
        }

        return (
          <>
            <SystemSettingsBreadcrumbToolbar
              activeTab={settingsTab}
              onTabChange={setSettingsTab}
            />
            <div className="border-border-subtle bg-bg-surface-elevated rounded-xl border p-4 md:p-6">
              {settingsTab === "equipment" ? (
                <SystemSettingsView canEdit={canEditSettings} />
              ) : (
                <PinCategoriesSettings useSettingsPrefix />
              )}
            </div>
          </>
        );
      }}
    </PageRenderer>
  );
}
