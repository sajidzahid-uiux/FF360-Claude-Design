import { HardHat } from "lucide-react";

export function CmsSignInLogo() {
  return (
    <HardHat
      aria-hidden
      className="h-8 w-8 shrink-0 text-current"
      strokeWidth={2}
    />
  );
}

export const CMS_SIGN_IN_BRAND = {
  appTitle: "FieldFlow360 CMS",
  title: "Sign in",
  description:
    "Manage clients, jobs, scheduling, and day-to-day field operations from one workspace.",
} as const;
