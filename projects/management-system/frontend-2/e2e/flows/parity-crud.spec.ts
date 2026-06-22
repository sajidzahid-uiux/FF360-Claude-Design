import { expect, test } from "@playwright/test";

import { gotoOrgRoute, isE2EAuthConfigured } from "../helpers/auth";

/**
 * Top 10 CRUD/navigation flows — parity smoke with classic frontend.
 * Requires: E2E_ORG_ID + (E2E_ACCESS_TOKEN or E2E_EMAIL/E2E_PASSWORD)
 */
test.describe("org-ui parity flows", () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(() => {
    test.skip(
      !isE2EAuthConfigured() || !process.env.E2E_ORG_ID,
      "Set E2E_ORG_ID and auth env vars to run E2E"
    );
  });

  test("1. contacts — list loads", async ({ page }) => {
    await gotoOrgRoute(page, "/contact");
    await expect(
      page.getByRole("heading", { name: /contact/i }).first()
    ).toBeVisible();
  });

  test("2. jobs repair — list loads", async ({ page }) => {
    await gotoOrgRoute(page, "/jobs/repair");
    await expect(page.getByText(/repair/i).first()).toBeVisible();
  });

  test("3. leads repair — list loads", async ({ page }) => {
    await gotoOrgRoute(page, "/leads/repair");
    await expect(page.getByText(/lead/i).first()).toBeVisible();
  });

  test("4. equipment — list loads", async ({ page }) => {
    await gotoOrgRoute(page, "/equipment");
    await expect(page.getByText(/equipment/i).first()).toBeVisible();
  });

  test("5. order pipe — list loads", async ({ page }) => {
    await gotoOrgRoute(page, "/order-pipe");
    await expect(page.getByText(/order pipe|order/i).first()).toBeVisible();
  });

  test("6. completed — list loads", async ({ page }) => {
    await gotoOrgRoute(page, "/completed");
    await expect(page.getByText(/completed|cancelled/i).first()).toBeVisible();
  });

  test("7. dashboard — loads", async ({ page }) => {
    await gotoOrgRoute(page, "/dashboard");
    await expect(page.locator("main")).toBeVisible();
  });

  test("8. team settings — loads", async ({ page }) => {
    await gotoOrgRoute(page, "/settings/org/team");
    await expect(page.getByText(/team/i).first()).toBeVisible();
  });

  test("9. book keeping — loads", async ({ page }) => {
    await gotoOrgRoute(page, "/book-keeping");
    await expect(
      page.getByText(/book.?keeping|invoice/i).first()
    ).toBeVisible();
  });

  test("10. maintenance — loads", async ({ page }) => {
    await gotoOrgRoute(page, "/maintenance");
    await expect(page.getByText(/maintenance/i).first()).toBeVisible();
  });
});

test.describe("contacts CRUD smoke", () => {
  test.beforeEach(() => {
    test.skip(
      !isE2EAuthConfigured() || !process.env.E2E_ORG_ID,
      "Set E2E_ORG_ID and auth env vars to run E2E"
    );
  });

  test("open add contact modal and validate required fields", async ({
    page,
  }) => {
    await gotoOrgRoute(page, "/contact");

    const addButton = page
      .getByRole("button", { name: /add contact|new contact/i })
      .first();
    if (!(await addButton.isVisible().catch(() => false))) {
      test.skip(true, "Add contact button not visible for this role");
    }

    await addButton.click();
    const saveButton = page
      .getByRole("button", { name: /save|create|add/i })
      .last();
    await saveButton.click();

    await expect(
      page.getByText(/contact detail|category|required/i).first()
    ).toBeVisible();
  });
});
