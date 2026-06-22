import { expect, test as setup } from "@playwright/test";

import { authenticateE2EPage } from "./helpers/auth";

setup("authenticate", async ({ page }) => {
  const authenticated = await authenticateE2EPage(page);
  if (!authenticated) {
    setup.skip(true, "Set E2E_ACCESS_TOKEN or E2E_EMAIL + E2E_PASSWORD");
    return;
  }

  await page.context().storageState({ path: "e2e/.auth/user.json" });
  expect(authenticated).toBe(true);
});
