import type { Page } from "@playwright/test";

const ACCESS_TOKEN_COOKIE = "access_token";

export function e2eOrgPath(orgId: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/organizations/${orgId}${normalized}`;
}

export function isE2EAuthConfigured(): boolean {
  return Boolean(
    process.env.E2E_ACCESS_TOKEN ||
    (process.env.E2E_EMAIL && process.env.E2E_PASSWORD)
  );
}

export async function authenticateE2EPage(page: Page): Promise<boolean> {
  const token = process.env.E2E_ACCESS_TOKEN;
  const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

  if (token) {
    await page.context().addCookies([
      {
        name: ACCESS_TOKEN_COOKIE,
        value: token.startsWith("JWT ") ? token.slice(4) : token,
        url: baseURL,
      },
    ]);
    return true;
  }

  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    return false;
  }

  await page.goto("/sign-in");
  await page.getByRole("button", { name: /log in|sign in|continue/i }).click();
  await page
    .waitForURL(/auth0|login/i, { timeout: 30_000 })
    .catch(() => undefined);

  const emailInput = page
    .locator('input[name="username"], input[type="email"]')
    .first();
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(email);
    await page
      .locator('input[name="password"], input[type="password"]')
      .first()
      .fill(password);
    await page
      .getByRole("button", { name: /continue|log in|sign in/i })
      .click();
  }

  await page
    .waitForURL(/organizations|dashboard/, { timeout: 60_000 })
    .catch(() => false);
  return /organizations|dashboard/.test(page.url());
}

export async function gotoOrgRoute(page: Page, path: string): Promise<void> {
  const orgId = process.env.E2E_ORG_ID;
  if (!orgId) {
    throw new Error("E2E_ORG_ID is required for org-scoped flow tests");
  }

  await page.goto(e2eOrgPath(orgId, path));
  await page.waitForLoadState("networkidle");
}
