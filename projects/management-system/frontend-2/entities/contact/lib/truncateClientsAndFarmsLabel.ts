const TRUNCATE_LENGTH = 20;

export function truncateClientsAndFarmsLabel(
  value: string,
  maxLength = TRUNCATE_LENGTH
): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}...`;
}
