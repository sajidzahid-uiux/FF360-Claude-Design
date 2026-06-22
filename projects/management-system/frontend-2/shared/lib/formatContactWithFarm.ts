export function formatContactWithFarm(
  contactName: string | undefined | null,
  farmName: string | undefined | null
): string {
  const contact = contactName || "N/A";
  if (farmName) {
    return `${contact} — ${farmName}`;
  }
  return contact;
}
