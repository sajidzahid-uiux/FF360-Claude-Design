import {
  Briefcase,
  ClipboardList,
  Package,
  UserPlus,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { APP_ROUTES, orgUrl } from "@/shared/config/routes";

/**
 * Canonical "create an asset" shortcuts shared by the global "+" menu
 * (top bar) and the floating quick-actions hub.
 *
 * Most open a URL-driven modal IN PLACE via `modal` ({ key, params }) — the
 * `?modal=` frame is layered on the CURRENT path so the underlying module never
 * changes. Only flows without a modal (the order wizard, the team-invite page)
 * fall back to navigating via `href`.
 */
export interface QuickCreateAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /**
   * Open this modal in place on the current path (preferred). When set, the
   * action must NOT navigate.
   */
  modal?: { key: string; params?: Record<string, string> };
  /** Fallback navigation target for flows that aren't a modal. */
  href?: (orgId: string | number) => string;
}

export const QUICK_CREATE_ACTIONS: QuickCreateAction[] = [
  {
    id: "add-lead",
    label: "New Lead",
    description: "Capture an incoming opportunity",
    icon: ClipboardList,
    modal: { key: "add-lead" },
  },
  {
    id: "add-job",
    label: "New Job",
    description: "Schedule field work",
    icon: Briefcase,
    modal: { key: "add-job" },
  },
  {
    id: "add-contact",
    label: "New Contact",
    description: "Add a client or vendor",
    icon: UserPlus,
    modal: { key: "add-contact" },
  },
  {
    id: "add-equipment",
    label: "New Equipment",
    description: "Register a machine or asset",
    icon: Wrench,
    modal: { key: "add-equipment", params: { type: "machine" } },
  },
  {
    id: "add-order",
    label: "New Order",
    description: "Open an order in the pipe",
    icon: Package,
    href: (orgId) => orgUrl(orgId, APP_ROUTES.orderPipe, "action=add"),
  },
];
