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
 * (top bar) and the floating quick-actions hub. Each target navigates to the
 * relevant list route with `?action=add`, which the list pages already honour
 * to auto-open their add modal — so no new creation flow is invented here.
 */
export interface QuickCreateAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Build the destination href for the given org. */
  href: (orgId: string | number) => string;
}

export const QUICK_CREATE_ACTIONS: QuickCreateAction[] = [
  {
    id: "add-lead",
    label: "New Lead",
    description: "Capture an incoming opportunity",
    icon: ClipboardList,
    href: (orgId) => orgUrl(orgId, APP_ROUTES.leads, "action=add"),
  },
  {
    id: "add-job",
    label: "New Job",
    description: "Schedule field work",
    icon: Briefcase,
    href: (orgId) => orgUrl(orgId, APP_ROUTES.jobsTiling, "action=add"),
  },
  {
    id: "add-contact",
    label: "New Contact",
    description: "Add a client or vendor",
    icon: UserPlus,
    href: (orgId) => orgUrl(orgId, APP_ROUTES.contact, "action=add"),
  },
  {
    id: "add-equipment",
    label: "New Equipment",
    description: "Register a machine or asset",
    icon: Wrench,
    href: (orgId) => orgUrl(orgId, APP_ROUTES.equipment, "action=add"),
  },
  {
    id: "add-order",
    label: "New Order",
    description: "Open an order in the pipe",
    icon: Package,
    href: (orgId) => orgUrl(orgId, APP_ROUTES.orderPipe, "action=add"),
  },
];
