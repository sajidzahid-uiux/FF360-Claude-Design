import { describe, expect, it } from "vitest";

import { APP_ROUTE_LABELS } from "@/shared/config/routes";

import { buildCmsAppBreadcrumbItems } from "../CmsAppBreadcrumbs";
import { buildCmsNavBreadcrumbLookup } from "../cmsNavigation";

const lookup = buildCmsNavBreadcrumbLookup([
  {
    id: "contacts",
    title: "Contacts",
    links: [
      {
        id: "contact",
        title: APP_ROUTE_LABELS.contact,
        href: "/contact",
        icon: null,
      },
    ],
  },
]);

describe("buildCmsAppBreadcrumbItems", () => {
  it("shows list page as a single current crumb", () => {
    const items = buildCmsAppBreadcrumbItems(
      "/organizations/12/contact",
      lookup
    );

    expect(items).toEqual([
      expect.objectContaining({
        label: APP_ROUTE_LABELS.contact,
        isCurrent: true,
        href: undefined,
      }),
    ]);
  });

  it("nests contact detail pages under Contact Info", () => {
    const items = buildCmsAppBreadcrumbItems(
      "/organizations/12/contact/456",
      lookup
    );

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      label: APP_ROUTE_LABELS.contact,
      isCurrent: false,
      href: "/organizations/12/contact",
    });
    expect(items[1]).toMatchObject({
      label: "Contact",
      isCurrent: true,
      href: undefined,
    });
  });

  it("uses page label overrides for entity detail crumbs", () => {
    const items = buildCmsAppBreadcrumbItems(
      "/organizations/12/contact/456",
      lookup,
      {
        "/organizations/12/contact/456": "Jane Client",
      }
    );

    expect(items[1]).toMatchObject({
      label: "Jane Client",
      isCurrent: true,
    });
    expect(items[0]).toMatchObject({
      label: APP_ROUTE_LABELS.contact,
      isCurrent: false,
    });
  });

  it("nests equipment detail under Equipment with override label", () => {
    const items = buildCmsAppBreadcrumbItems(
      "/organizations/12/equipment/99",
      lookup,
      {
        "/organizations/12/equipment/99": "Excavator 01",
      }
    );

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      label: "Equipment",
      href: "/organizations/12/equipment",
      isCurrent: false,
    });
    expect(items[1]).toMatchObject({
      label: "Excavator 01",
      isCurrent: true,
    });
  });

  it("inserts equipment type between Equipment and detail name when type override is set", () => {
    const items = buildCmsAppBreadcrumbItems(
      "/organizations/12/equipment/99",
      lookup,
      {
        "/organizations/12/equipment/99": "DEER-45T-BLUE",
        "/organizations/12/equipment/99/@type": "Vehicle",
      }
    );

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      label: "Equipment",
      href: "/organizations/12/equipment",
      isCurrent: false,
    });
    expect(items[1]).toMatchObject({
      label: "Vehicle",
      href: "/organizations/12/equipment",
      isCurrent: false,
    });
    expect(items[2]).toMatchObject({
      label: "DEER-45T-BLUE",
      isCurrent: true,
    });
  });

  it("nests equipment logs under the equipment detail crumb", () => {
    const items = buildCmsAppBreadcrumbItems(
      "/organizations/12/equipment/99/logs",
      lookup,
      {
        "/organizations/12/equipment/99": "Excavator 01",
      }
    );

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      label: "Equipment",
      href: "/organizations/12/equipment",
    });
    expect(items[1]).toMatchObject({
      label: "Excavator 01",
      href: "/organizations/12/equipment/99",
      isCurrent: false,
    });
    expect(items[2]).toMatchObject({
      label: "Logs",
      isCurrent: true,
    });
  });

  it("nests contact logs under the contact detail crumb", () => {
    const items = buildCmsAppBreadcrumbItems(
      "/organizations/12/contact/456/logs",
      lookup,
      {
        "/organizations/12/contact/456": "Jane Client",
      }
    );

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      label: APP_ROUTE_LABELS.contact,
      href: "/organizations/12/contact",
    });
    expect(items[1]).toMatchObject({
      label: "Jane Client",
      href: "/organizations/12/contact/456",
      isCurrent: false,
    });
    expect(items[2]).toMatchObject({
      label: "Logs",
      isCurrent: true,
      href: undefined,
    });
  });
});
