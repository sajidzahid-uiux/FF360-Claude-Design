"use client";

/**
 * Shared chrome for the local prototyping hub (/hub, /flows/*).
 *
 * Follows the @fieldflow360/org-ui design system: the root is scoped with the
 * `dark` class (which org-ui defines with the full semantic palette), so the
 * hub renders in the design system's dark theme WITHOUT mutating the global CMS
 * ThemeProvider. Colors come from org-ui semantic token utilities
 * (bg-bg-app, bg-bg-surface-elevated, text-text-primary/-muted, border-border-subtle)
 * — the same tokens the /design-system renderers use — plus the lime brand accent.
 */
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  LayoutDashboard,
  LayoutGrid,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { ReactNode } from "react";

/** Lime brand accent (matches --accent-lime in cms-app-extensions.css). */
const ACCENT = "#c2d658";

/** String-keyed icon registry so server pages can pass icons without crossing
 *  the server/client boundary with component references. */
const ICONS: Record<string, LucideIcon> = {
  "design-system": Blocks,
  cms: LayoutDashboard,
  flows: Workflow,
};

export function PrototypeChrome({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Kept for API compatibility with existing pages; nav was removed. */
  active?: string;
  children: ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-bg-app text-text-primary antialiased">
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-app/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <Link href="/hub" className="inline-flex items-center gap-2.5">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg text-sm font-bold text-zinc-950"
              style={{ backgroundColor: ACCENT }}
            >
              FF
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight text-text-primary">
                FieldFlow360
              </span>
              <span className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-text-muted">
                Prototyping
              </span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
            Prototyping environment
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-base leading-relaxed text-text-muted">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}

export function PrototypeCard({
  href,
  external,
  title,
  description,
  badge,
  icon,
  className,
}: {
  href: string;
  external?: boolean;
  title: string;
  description: string;
  badge?: string;
  icon?: string;
  className?: string;
}) {
  const Icon = (icon && ICONS[icon]) || LayoutGrid;

  const inner = (
    <div className="flex h-full flex-col rounded-2xl border border-border-subtle bg-bg-surface-elevated p-6 transition-colors hover:border-border-strong hover:bg-bg-hover">
      <span
        className="inline-grid h-12 w-12 place-items-center rounded-xl text-zinc-950"
        style={{ backgroundColor: ACCENT }}
      >
        <Icon className="h-6 w-6" />
      </span>

      <div className="mt-5 flex items-center gap-2">
        <h3 className="text-base font-semibold tracking-tight text-text-primary">
          {title}
        </h3>
        {badge ? (
          <span className="rounded-full border border-border-subtle bg-bg-hover px-2 py-0.5 text-xs font-medium text-text-muted">
            {badge}
          </span>
        ) : null}
      </div>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
        {description}
      </p>

      <span className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-text-primary px-4 py-2 text-sm font-semibold text-text-inverse transition-opacity group-hover:opacity-90">
        Open
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  );

  const wrapperClass = "group block h-full " + (className ?? "");

  if (external) {
    return (
      <a href={href} className={wrapperClass}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={wrapperClass}>
      {inner}
    </Link>
  );
}

export function GallerySection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-text-primary">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        ) : null}
      </div>
      <div className="rounded-2xl border border-border-subtle bg-bg-surface-elevated p-6">
        {children}
      </div>
    </section>
  );
}
