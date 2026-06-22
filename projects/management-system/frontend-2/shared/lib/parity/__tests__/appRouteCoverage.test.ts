import path from "path";
import { describe, expect, it } from "vitest";

import {
  ORG_APP_ROUTE_REGISTRY,
  PUBLIC_APP_ROUTE_REGISTRY,
} from "../appRouteRegistry";
import {
  discoverAppPages,
  normalizedPathMatchesPattern,
} from "../discoverAppPages";

const APP_DIR = path.resolve(import.meta.dirname, "../../../../app");
const FRONTEND_V1_APP_DIR = path.resolve(
  import.meta.dirname,
  "../../../../../frontend/app"
);

const FEATURE_PAGE_MARKERS = [
  "createLazyRoutePage",
  "PageContent",
  "LazyJobLead",
  "ActivityLogPage",
  "Dashboard",
  "redirect(",
  "JobPagePermissionGate",
  "SettingsPageContent",
  "OrganizationSettingsTab",
  "GeneralSettingsSection",
  "OrgDesignParametersSettings",
  "RoleAndAccessOverview",
  "FYINotificationsTable",
  "NotificationPreferencesTable",
  "PasswordCard",
  "ThemeControls",
  "UserDeletePageContent",
];

describe("app route coverage (frontend-2)", () => {
  const pages = discoverAppPages(APP_DIR);
  const orgPages = pages.filter((page) => page.normalizedOrgPath !== null);
  const publicPages = pages.filter((page) => page.normalizedOrgPath === null);

  it("discovers org-scoped pages under app/organizations/[orgId]", () => {
    expect(orgPages.length).toBeGreaterThanOrEqual(65);
  });

  it("matches each non-redirect org registry route to a discovered page", () => {
    const unmatched: string[] = [];

    for (const route of ORG_APP_ROUTE_REGISTRY) {
      if (route.kind === "redirect") continue;

      const found = orgPages.some(
        (page) =>
          page.normalizedOrgPath !== null &&
          normalizedPathMatchesPattern(
            page.normalizedOrgPath,
            route.normalizedPath
          )
      );

      if (!found) {
        unmatched.push(route.normalizedPath);
      }
    }

    expect(unmatched, unmatched.join("\n")).toEqual([]);
  });

  it("every org page is registered or is a known redirect-only route", () => {
    const redirectPaths = new Set(
      ORG_APP_ROUTE_REGISTRY.filter((route) => route.kind === "redirect").map(
        (route) => route.normalizedPath
      )
    );

    const unregistered: string[] = [];

    for (const page of orgPages) {
      if (!page.normalizedOrgPath || page.normalizedOrgPath === "/") continue;
      if (redirectPaths.has(page.normalizedOrgPath)) continue;

      const registered = ORG_APP_ROUTE_REGISTRY.some((route) =>
        normalizedPathMatchesPattern(
          page.normalizedOrgPath!,
          route.normalizedPath
        )
      );

      if (!registered) {
        unregistered.push(page.normalizedOrgPath);
      }
    }

    expect(unregistered, unregistered.join("\n")).toEqual([]);
  });

  it("org feature pages wire to feature modules (lazy PageContent or gate)", () => {
    const offenders: string[] = [];

    for (const page of orgPages) {
      if (!page.normalizedOrgPath) continue;
      if (page.source.includes("redirect(")) continue;

      const hasMarker = FEATURE_PAGE_MARKERS.some((marker) =>
        page.source.includes(marker)
      );

      if (!hasMarker) {
        offenders.push(page.routePath);
      }
    }

    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("covers all public routes in the registry", () => {
    for (const route of PUBLIC_APP_ROUTE_REGISTRY) {
      const found = publicPages.some(
        (page) => page.routePath === route.normalizedPath
      );
      expect(found, route.normalizedPath).toBe(true);
    }
  });
});

describe("classic frontend route parity (page count)", () => {
  it("ships at least as many org pages as frontend v1", () => {
    const v2Org = discoverAppPages(APP_DIR).filter(
      (page) => page.normalizedOrgPath !== null
    );
    const v1Org = discoverAppPages(FRONTEND_V1_APP_DIR).filter((page) =>
      page.routePath.match(/^\/:orgId(\/|$)/)
    );

    expect(v2Org.length).toBeGreaterThanOrEqual(v1Org.length - 2);
  });
});
