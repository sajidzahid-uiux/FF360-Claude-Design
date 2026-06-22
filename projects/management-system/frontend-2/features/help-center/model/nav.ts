export type HelpCenterSectionId =
  | "knowledge-base"
  | "help-center"
  | "contact-support";

export interface HelpCenterNavItem {
  id: HelpCenterSectionId;
  label: string;
  description: string;
  href: string;
}

export const HELP_CENTER_NAV_ITEMS: readonly HelpCenterNavItem[] = [
  {
    id: "knowledge-base",
    label: "Knowledge Base",
    description: "Browse articles and tutorials",
    href: "/help-center/knowledge-base",
  },
  {
    id: "help-center",
    label: "Help Center",
    description: "Find answers to common questions",
    href: "/help-center",
  },
  {
    id: "contact-support",
    label: "Contact Support",
    description: "Get in touch with our support team",
    href: "/help-center/contact-support",
  },
] as const;

export function getHelpCenterSectionFromPath(
  pathname: string
): HelpCenterSectionId {
  if (pathname.startsWith("/help-center/knowledge-base")) {
    return "knowledge-base";
  }
  if (pathname.startsWith("/help-center/contact-support")) {
    return "contact-support";
  }
  return "help-center";
}
