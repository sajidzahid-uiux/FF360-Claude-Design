import type { QuickAction } from "@/api/types";

/** Primary label for list rows, page header, and breadcrumbs. */
export function getQuickActionDisplayTitle(quickAction: QuickAction): string {
  const name = quickAction.name?.trim();
  if (name) {
    return name;
  }

  const email = quickAction.email?.trim();
  if (email) {
    return email;
  }

  const phone = quickAction.phone_number?.trim();
  if (phone) {
    return phone;
  }

  const description = quickAction.description?.trim();
  if (description) {
    return description.length > 60
      ? `${description.slice(0, 57)}…`
      : description;
  }

  return `Quick Action #${quickAction.id}`;
}

/** Secondary line under the page title (contact detail uses address). */
export function getQuickActionDisplaySubtitle(
  quickAction: QuickAction
): string {
  const title = getQuickActionDisplayTitle(quickAction);
  const name = quickAction.name?.trim();
  const email = quickAction.email?.trim();
  const phone = quickAction.phone_number?.trim();
  const parts: string[] = [];

  if (name && title === name) {
    if (email) {
      parts.push(email);
    }
    if (phone) {
      parts.push(phone);
    }
  } else if (email && title === email && phone) {
    parts.push(phone);
  } else if (phone && title === phone && email) {
    parts.push(email);
  }

  if (parts.length > 0) {
    return parts.join(" · ");
  }

  const description = quickAction.description?.trim();
  if (description && description !== title) {
    return description.length > 120
      ? `${description.slice(0, 117)}…`
      : description;
  }

  return "No contact details provided";
}
