import { ButtonVariantEnum } from "@fieldflow360/org-ui";

/** Teal/brand primary CTA (Add Schedule, Edit Schedule) — not accent lime. */
export const calendarPrimaryButtonProps = {
  variant: ButtonVariantEnum.COLORED,
  backgroundColor: "var(--primary)",
  foregroundColor: "var(--color-primary-foreground)",
} as const;

/** Dark neutral secondary CTA (View Details, View Job/Lead). */
export const calendarDarkButtonProps = {
  variant: ButtonVariantEnum.COLORED,
  backgroundColor: "#27272a",
  foregroundColor: "#ffffff",
} as const;

/** Green confirm action (Save Dates). */
export const calendarSaveButtonProps = {
  variant: ButtonVariantEnum.COLORED,
  backgroundColor: "var(--color-accent-green-bold)",
  foregroundColor: "#ffffff",
} as const;
