/** Extract filename from a Content-Disposition response header. */
export function parseContentDispositionFilename(
  header: string | undefined
): string | null {
  if (!header) return null;

  const utf8Match = header.match(/filename\*=UTF-8''([^;\n]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/["']/g, ""));
    } catch {
      return utf8Match[1].replace(/["']/g, "");
    }
  }

  const quotedMatch = header.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) return quotedMatch[1];

  const plainMatch = header.match(/filename=([^;\n]+)/i);
  if (plainMatch?.[1]) return plainMatch[1].trim().replace(/["']/g, "");

  return null;
}
