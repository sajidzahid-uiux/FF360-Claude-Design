import { describe, expect, it } from "vitest";

import {
  CMS_V1_DEV_URL,
  CMS_V2_DEV_URL,
  getAlternateCmsDevUrl,
  getCmsDefaultPath,
  isDevCmsHost,
} from "../cmsVersionSwitcher";

describe("cmsVersionSwitcher", () => {
  it("treats dev deployment hosts as dev CMS only", () => {
    expect(isDevCmsHost("localhost")).toBe(false);
    expect(isDevCmsHost("127.0.0.1")).toBe(false);
    expect(isDevCmsHost("app.dev.fieldflow360.com")).toBe(true);
    expect(isDevCmsHost("www.app-new.dev.fieldflow360.com")).toBe(true);
    expect(isDevCmsHost("app.fieldflow360.com")).toBe(false);
    expect(isDevCmsHost("www.fieldflow360.com")).toBe(false);
  });

  it("builds default landing paths per frontend", () => {
    expect(getCmsDefaultPath("v2")).toBe("/organizations?pick_org=1");
    expect(getCmsDefaultPath("v1")).toBe("/choose-org");
    expect(getCmsDefaultPath("v2", "127")).toBe("/organizations/127/dashboard");
    expect(getCmsDefaultPath("v1", "127")).toBe("/127/dashboard");
  });

  it("does not offer version switch URLs on localhost", () => {
    expect(getAlternateCmsDevUrl("v1", "localhost")).toBeNull();
    expect(getAlternateCmsDevUrl("v2", "127.0.0.1")).toBeNull();
  });

  it("returns alternate dev URLs with default landing pages", () => {
    expect(getAlternateCmsDevUrl("v1", "app.dev.fieldflow360.com")).toBe(
      `${CMS_V2_DEV_URL}/organizations?pick_org=1`
    );
    expect(
      getAlternateCmsDevUrl("v2", "www.app-new.dev.fieldflow360.com")
    ).toBe(`${CMS_V1_DEV_URL}/choose-org`);
    expect(getAlternateCmsDevUrl("v1", "app.fieldflow360.com")).toBeNull();
  });

  it("uses last org dashboard when switching versions", () => {
    expect(getAlternateCmsDevUrl("v1", "app.dev.fieldflow360.com", "42")).toBe(
      `${CMS_V2_DEV_URL}/organizations/42/dashboard`
    );
    expect(
      getAlternateCmsDevUrl("v2", "www.app-new.dev.fieldflow360.com", "42")
    ).toBe(`${CMS_V1_DEV_URL}/42/dashboard`);
  });
});
