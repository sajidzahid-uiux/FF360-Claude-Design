import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

export interface DiscoveredAppPage {
  /** Route path relative to `app/` (e.g. `organizations/[orgId]/dashboard`). */
  appRelativeDir: string;
  /** Full filesystem path to `page.tsx`. */
  pageFilePath: string;
  /** `/organizations/:orgId/dashboard` style path, or public `/sign-in`. */
  routePath: string;
  /** Normalized org app path without prefix, e.g. `/dashboard`. */
  normalizedOrgPath: string | null;
  source: string;
}

function segmentToRoutePart(segment: string): string {
  if (segment.startsWith("[") && segment.endsWith("]")) {
    return `:${segment.slice(1, -1)}`;
  }
  return segment;
}

function walkAppDir(appDir: string, onPage: (dir: string) => void) {
  for (const entry of readdirSync(appDir)) {
    const full = join(appDir, entry);
    if (!statSync(full).isDirectory()) continue;
    if (existsSync(join(full, "page.tsx"))) {
      onPage(full);
    }
    walkAppDir(full, onPage);
  }
}

export function discoverAppPages(appDir: string): DiscoveredAppPage[] {
  const pages: DiscoveredAppPage[] = [];

  const recordPage = (dir: string) => {
    const appRelativeDir = relative(appDir, dir).split(/[/\\]/).join("/");
    const parts = appRelativeDir
      ? appRelativeDir.split("/").filter(Boolean).map(segmentToRoutePart)
      : [];
    const routePath = parts.length ? `/${parts.join("/")}` : "/";
    const pageFilePath = join(dir, "page.tsx");
    const source = readFileSync(pageFilePath, "utf8");

    let normalizedOrgPath: string | null = null;
    const orgMatch = routePath.match(/^\/organizations\/:orgId(\/.*)?$/);
    if (orgMatch) {
      normalizedOrgPath = orgMatch[1] ?? "";
      if (normalizedOrgPath === "") {
        normalizedOrgPath = "/";
      }
    }

    pages.push({
      appRelativeDir,
      pageFilePath,
      routePath,
      normalizedOrgPath,
      source,
    });
  };

  if (existsSync(join(appDir, "page.tsx"))) {
    recordPage(appDir);
  }

  walkAppDir(appDir, recordPage);

  return pages.sort((a, b) => a.routePath.localeCompare(b.routePath));
}

export function normalizedPathMatchesPattern(
  path: string,
  pattern: string
): boolean {
  const pathParts = path.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);

  if (pathParts.length !== patternParts.length) return false;

  return patternParts.every((part, index) => {
    if (part.startsWith(":")) return true;
    return part === pathParts[index];
  });
}
