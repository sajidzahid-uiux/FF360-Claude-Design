import domPurify from "dompurify";

// Sanitization profiles: TEXT (no HTML), BASIC_HTML (bold/italic), RICH_TEXT (paragraphs/links)
export const SANITIZATION_PROFILES = {
  TEXT: {
    ALLOWED_TAGS: [] as string[],
    ALLOWED_ATTR: [] as string[],
  },
  BASIC_HTML: {
    ALLOWED_TAGS: ["b", "i", "u", "strong", "em"] as string[],
    ALLOWED_ATTR: [] as string[],
  },
  RICH_TEXT: {
    ALLOWED_TAGS: [
      "p",
      "br",
      "b",
      "i",
      "u",
      "strong",
      "em",
      "a",
      "ul",
      "ol",
      "li",
    ] as string[],
    ALLOWED_ATTR: ["href", "target", "rel"] as string[],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  },
};

export type SanitizationProfile = "TEXT" | "BASIC_HTML" | "RICH_TEXT";

// Sanitize HTML with specified profile
export function sanitizeHtml(
  input: string,
  profile: SanitizationProfile = "TEXT"
): string {
  if (typeof input !== "string") {
    console.warn(
      "sanitizeHtml: Expected string input, received:",
      typeof input
    );
    return "";
  }

  if (!input.trim()) return "";

  try {
    return domPurify.sanitize(input, SANITIZATION_PROFILES[profile]);
  } catch (error) {
    console.error("sanitizeHtml: Error during sanitization:", error);
    return "";
  }
}

// Sanitize to plain text (removes all HTML)
export function sanitizeText(input: string): string {
  return sanitizeHtml(input, "TEXT");
}

// Sanitize specific fields in an object
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[],
  profile: SanitizationProfile = "TEXT"
): T {
  if (!obj || typeof obj !== "object") {
    console.warn("sanitizeObject: Expected object input");
    return obj;
  }

  const sanitized = { ...obj };

  fields.forEach((field) => {
    const value = sanitized[field];
    if (typeof value === "string") {
      sanitized[field] = sanitizeHtml(value, profile) as T[keyof T];
    }
  });

  return sanitized;
}

// Sanitize array of strings
export function sanitizeArray(
  arr: string[],
  profile: SanitizationProfile = "TEXT"
): string[] {
  if (!Array.isArray(arr)) {
    console.warn("sanitizeArray: Expected array input");
    return [];
  }

  return arr.map((item) => {
    if (typeof item === "string") {
      return sanitizeHtml(item, profile);
    }
    return item;
  });
}

// Check for XSS patterns
export function isSuspiciousInput(input: string): boolean {
  if (typeof input !== "string") return false;

  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i,
    /vbscript:/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(input));
}

// Sanitize and log suspicious inputs
export function sanitizeAndLog(
  input: string,
  fieldName: string,
  profile: SanitizationProfile = "TEXT"
): string {
  if (isSuspiciousInput(input)) {
    console.warn(`Suspicious input in "${fieldName}":`, {
      originalLength: input.length,
      preview: input.substring(0, 100),
      timestamp: new Date().toISOString(),
    });
  }

  return sanitizeHtml(input, profile);
}

export function sanitizeTextWithMentions(input: string): string {
  if (typeof input !== "string") {
    console.warn(
      "sanitizeTextWithMentions: Expected string input, received:",
      typeof input
    );
    return "";
  }

  if (!input.trim()) return "";

  try {
    const mentionPattern = /@(\w+)/g;
    const mentions: Array<{ text: string; index: number }> = [];
    let match;

    while ((match = mentionPattern.exec(input)) !== null) {
      mentions.push({
        text: match[0],
        index: match.index,
      });
    }

    // Replace mentions with placeholders
    let textWithPlaceholders = input;
    const placeholders: string[] = [];

    mentions.forEach((mention, i) => {
      const placeholder = `__MENTION_${i}__`;
      placeholders.push(placeholder);
      textWithPlaceholders = textWithPlaceholders.replace(
        mention.text,
        placeholder
      );
    });

    // Sanitize the text with placeholders
    let sanitized = sanitizeText(textWithPlaceholders);

    // Restore mentions
    mentions.forEach((mention, i) => {
      sanitized = sanitized.replace(placeholders[i], mention.text);
    });

    return sanitized;
  } catch (error) {
    console.error(
      "sanitizeTextWithMentions: Error during sanitization:",
      error
    );
    return sanitizeText(input);
  }
}
