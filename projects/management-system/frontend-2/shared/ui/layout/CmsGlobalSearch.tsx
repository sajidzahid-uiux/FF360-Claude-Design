"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Briefcase, ClipboardList, Compass, Search, UserRound } from "lucide-react";

import { LeadType } from "@/constants/enums";
import { useAllJobsQuery } from "@/hooks";
import { useContacts } from "@/hooks/queries/useContacts";
import { useLeadsByType } from "@/hooks/queries/useLeadV2Queries";
import { useDebounceNavigation } from "@/hooks/useDebounceNavigation";
import { useRouteIds } from "@/hooks/useRouteIds";
import { APP_ROUTES, orgRoute, orgUrl } from "@/shared/config/routes";

type ResultGroup = "Pages" | "Contacts" | "Leads" | "Jobs";

interface SearchResult {
  id: string;
  group: ResultGroup;
  label: string;
  sublabel?: string;
  href: string;
}

const LEAD_SEGMENT: Record<string, string> = {
  [LeadType.TILING]: "drainage-tiling",
  [LeadType.EXCAVATION]: "excavation",
  [LeadType.REPAIR]: "repair",
};

const JOB_SEGMENT: Record<string, string> = {
  drainage_tiling: "drainage-tiling",
  tiling: "drainage-tiling",
  excavation: "excavation",
  repair: "repair",
};

const GROUP_ICON: Record<ResultGroup, React.ReactNode> = {
  Pages: <Compass className="h-4 w-4" />,
  Contacts: <UserRound className="h-4 w-4" />,
  Leads: <ClipboardList className="h-4 w-4" />,
  Jobs: <Briefcase className="h-4 w-4" />,
};

function contactName(record: { full_name?: string; id: number }) {
  return record.full_name?.trim() || `Contact #${record.id}`;
}

function recordName(record: {
  contact_info?: { full_name?: string };
  id: number;
}) {
  return record.contact_info?.full_name?.trim() || `#${record.id}`;
}

/** Pages reachable from the search palette (navigation results). */
function buildPageEntries(orgId: string | number) {
  return [
    { label: "Dashboard", href: orgRoute(orgId, APP_ROUTES.dashboard) },
    { label: "Leads", href: orgRoute(orgId, APP_ROUTES.leads) },
    { label: "Jobs", href: orgRoute(orgId, APP_ROUTES.jobsTiling) },
    { label: "Contacts", href: orgRoute(orgId, APP_ROUTES.contact) },
    { label: "Equipment", href: orgRoute(orgId, APP_ROUTES.equipment) },
    { label: "Order Pipe", href: orgRoute(orgId, APP_ROUTES.orderPipe) },
    { label: "Calendar", href: orgRoute(orgId, APP_ROUTES.calendar) },
    { label: "Map", href: orgRoute(orgId, APP_ROUTES.map) },
    { label: "Messages", href: orgRoute(orgId, APP_ROUTES.messages) },
    { label: "Team", href: orgRoute(orgId, APP_ROUTES.team) },
    {
      label: "Organization Settings",
      href: orgRoute(orgId, APP_ROUTES.organizationSettings),
    },
    { label: "User Settings", href: orgRoute(orgId, APP_ROUTES.userSettings) },
  ];
}

export function CmsGlobalSearch() {
  const { orgId } = useRouteIds();
  const { navigateTo } = useDebounceNavigation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const term = query.trim().toLowerCase();
  const active = open && term.length >= 1 && !!orgId;

  // Record sources — only fetched while the palette is open with a query.
  const { contacts } = useContacts({ search: query, page_size: 50 }, active);
  const tilingLeads = useLeadsByType(LeadType.TILING, {});
  const excavationLeads = useLeadsByType(LeadType.EXCAVATION, {});
  const repairLeads = useLeadsByType(LeadType.REPAIR, {});
  const { data: jobs } = useAllJobsQuery({ enabled: active });

  const results = useMemo<SearchResult[]>(() => {
    if (!active || !orgId) return [];
    const out: SearchResult[] = [];
    const matches = (text: string) => text.toLowerCase().includes(term);

    // Pages
    for (const page of buildPageEntries(orgId)) {
      if (matches(page.label)) {
        out.push({
          id: `page:${page.href}`,
          group: "Pages",
          label: page.label,
          href: page.href,
        });
      }
    }

    // Contacts (match on name or company)
    for (const contact of (contacts ?? []).slice(0, 50)) {
      const name = contactName(contact);
      if (matches(name) || matches(contact.company_name ?? "")) {
        out.push({
          id: `contact:${contact.id}`,
          group: "Contacts",
          label: name,
          sublabel: contact.company_name || undefined,
          href: orgUrl(orgId, `/contact/${contact.id}`),
        });
      }
    }

    // Leads (per type → segment is known)
    const leadSources: { type: LeadType; data?: unknown }[] = [
      { type: LeadType.TILING, data: tilingLeads.data },
      { type: LeadType.EXCAVATION, data: excavationLeads.data },
      { type: LeadType.REPAIR, data: repairLeads.data },
    ];
    for (const { type, data } of leadSources) {
      const list = Array.isArray(data)
        ? data
        : ((data as { results?: unknown[] } | undefined)?.results ?? []);
      const segment = LEAD_SEGMENT[type] ?? "repair";
      for (const lead of list as Array<{
        id: number;
        contact_info?: { full_name?: string };
      }>) {
        const name = recordName(lead);
        if (matches(name)) {
          out.push({
            id: `lead:${segment}:${lead.id}`,
            group: "Leads",
            label: name,
            sublabel: `${LEAD_SEGMENT[type] ?? "repair"} lead`,
            href: orgUrl(orgId, `/leads/${segment}/${lead.id}`),
          });
        }
      }
    }

    // Jobs (object_type → segment)
    for (const job of (jobs ?? []) as Array<{
      id: number;
      object_type?: string;
      contact_info?: { full_name?: string };
    }>) {
      const segment = JOB_SEGMENT[job.object_type ?? ""] ?? "drainage-tiling";
      const name = recordName(job);
      if (matches(name)) {
        out.push({
          id: `job:${segment}:${job.id}`,
          group: "Jobs",
          label: name,
          sublabel: `${segment} job`,
          href: orgUrl(orgId, `/jobs/${segment}/${job.id}`),
        });
      }
    }

    return out.slice(0, 24);
  }, [
    active,
    orgId,
    term,
    contacts,
    tilingLeads.data,
    excavationLeads.data,
    repairLeads.data,
    jobs,
  ]);

  const grouped = useMemo(() => {
    const order: ResultGroup[] = ["Pages", "Contacts", "Leads", "Jobs"];
    return order
      .map((group) => ({
        group,
        items: results.filter((r) => r.group === group).slice(0, 6),
      }))
      .filter((g) => g.items.length > 0);
  }, [results]);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    navigateTo(href);
  };

  return (
    <div ref={containerRef} className="relative w-44 shrink-0 sm:w-60">
      <div className="border-border bg-bg-surface focus-within:ring-accent/35 flex h-10 items-center gap-2 rounded-lg border px-3 focus-within:ring-2">
        <Search aria-hidden className="text-text-muted h-4 w-4 shrink-0" />
        <input
          aria-label="Search"
          className="text-text-primary placeholder:text-text-muted h-full w-full bg-transparent text-sm outline-none"
          placeholder="Search…"
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && term.length >= 1 ? (
        <div className="bg-bg-surface-elevated border-border-subtle absolute left-0 z-50 mt-2 max-h-[60vh] w-[min(28rem,90vw)] overflow-y-auto rounded-lg border shadow-lg">
          {grouped.length === 0 ? (
            <p className="text-text-muted px-4 py-6 text-center text-sm">
              No matches for “{query.trim()}”
            </p>
          ) : (
            grouped.map((section) => (
              <div key={section.group} className="py-1">
                <p className="text-text-muted px-4 py-1 text-[11px] font-semibold tracking-wide uppercase">
                  {section.group}
                </p>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    className="hover:bg-bg-hover flex w-full items-center gap-3 px-4 py-2 text-left transition-colors"
                    type="button"
                    onClick={() => go(item.href)}
                  >
                    <span className="text-text-muted shrink-0">
                      {GROUP_ICON[section.group]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-text-primary block truncate text-sm font-medium">
                        {item.label}
                      </span>
                      {item.sublabel ? (
                        <span className="text-text-muted block truncate text-xs capitalize">
                          {item.sublabel}
                        </span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
