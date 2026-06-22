import type { SupportTicketSubject } from "./types";

export interface SupportTeamCard {
  title: string;
  description: string;
  email: string;
  responseTime: string;
}

export const SUPPORT_TEAM_CARDS: readonly SupportTeamCard[] = [
  {
    title: "Technical Support",
    description:
      "For issues with the platform, features, or technical problems",
    email: "customer.support@fieldflow360.com",
    responseTime: "Within 2 hours",
  },
  {
    title: "Account Support",
    description: "For billing, subscription, or account-related questions",
    email: "customer.support@fieldflow360.com",
    responseTime: "Within 4 hours",
  },
  {
    title: "Training Team",
    description: "For help with onboarding or training requests",
    email: "customer.support@fieldflow360.com",
    responseTime: "Within 24 hours",
  },
] as const;

export const CALENDLY_BOOKING_URL =
  "https://calendly.com/customer-support-fieldflow360/new-meeting";

export const SUPPORT_SUBJECT_OPTIONS: readonly {
  value: SupportTicketSubject;
  label: string;
  description: string;
}[] = [
  {
    value: "technical",
    label: "Technical Support",
    description: "Platform, features, or technical problems",
  },
  {
    value: "account",
    label: "Account Support",
    description: "Billing, subscription, or account questions",
  },
  {
    value: "training",
    label: "Training Team",
    description: "Onboarding or training requests",
  },
  {
    value: "other",
    label: "Other",
    description: "General questions not covered above",
  },
] as const;
