import type { FieldFlowSidebarLink } from "@fieldflow360/org-ui";
import { describe, expect, it } from "vitest";

import { APP_ROUTES, orgPath } from "@/shared/config/routes";

import {
  collectExpandableParentIds,
  isNavItemActive,
  isPathActive,
  resolveNavHref,
} from "../cmsSidebarNavUtils";

const ORG_ID = "42";

describe("cmsSidebarNavUtils", () => {
  describe("resolveNavHref", () => {
    it("prefixes relative routes with the organization path", () => {
      expect(resolveNavHref(APP_ROUTES.calendar, ORG_ID)).toBe(
        orgPath(ORG_ID, APP_ROUTES.calendar)
      );
    });

    it("leaves already-scoped organization routes unchanged", () => {
      const href = orgPath(ORG_ID, APP_ROUTES.dashboard);
      expect(resolveNavHref(href, ORG_ID)).toBe(href);
    });
  });

  describe("isPathActive", () => {
    it("returns false when pathname is null", () => {
      const href = orgPath(ORG_ID, APP_ROUTES.calendar);
      expect(isPathActive(null, href)).toBe(false);
    });
  });

  describe("isNavItemActive", () => {
    const leadsChildren: FieldFlowSidebarLink[] = [
      {
        id: "leads-repair",
        title: "Repair",
        href: APP_ROUTES.leadsRepair,
        icon: null,
      },
    ];

    it("matches exact and nested paths", () => {
      const href = orgPath(ORG_ID, APP_ROUTES.calendar);
      expect(isNavItemActive(href, href)).toBe(true);
      expect(isNavItemActive(`${href}/details`, href)).toBe(true);
      expect(isNavItemActive(orgPath(ORG_ID, APP_ROUTES.dashboard), href)).toBe(
        false
      );
    });

    it("matches active child routes for expandable parents", () => {
      const parentHref = orgPath(ORG_ID, APP_ROUTES.leads);
      const childHref = orgPath(ORG_ID, APP_ROUTES.leadsRepair);

      expect(
        isNavItemActive(childHref, parentHref, leadsChildren, ORG_ID)
      ).toBe(true);
      expect(
        isNavItemActive(`${childHref}/123`, parentHref, leadsChildren, ORG_ID)
      ).toBe(true);
    });
  });

  describe("collectExpandableParentIds", () => {
    it("returns parent ids whose children match the current path", () => {
      const links: FieldFlowSidebarLink[] = [
        {
          id: "leads",
          title: "Leads",
          href: APP_ROUTES.leads,
          icon: null,
          children: [
            {
              id: "leads-repair",
              title: "Repair",
              href: APP_ROUTES.leadsRepair,
              icon: null,
            },
          ],
        },
      ];

      expect(
        collectExpandableParentIds(
          links,
          orgPath(ORG_ID, APP_ROUTES.leadsRepair),
          ORG_ID
        )
      ).toEqual(["leads"]);
    });
  });
});
