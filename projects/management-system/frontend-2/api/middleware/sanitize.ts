import { InternalAxiosRequestConfig } from "axios";

import { sanitizeText } from "@/utils/validation";

// Fields that should NOT be sanitized (IDs, tokens, technical fields, OAuth params)
const EXCLUDE_FIELDS = [
  "id",
  "content_type",
  "object_id",
  "user_id",
  "org_id",
  "organization_id",
  "job_id",
  "lead_id",
  "task_id",
  "equipment_id",
  "contact_id",
  "mentioned_members",
  "assigned_to",
  "status",
  "priority",
  "latitude",
  "longitude",
  "coordinates",
  "geojson",
  "token",
  "password",
  "refresh",
  "access",
  "file",
  "image",
  "attachment",
  "upload",
  "created_at",
  "updated_at",
  "deleted_at",
  "is_active",
  "is_deleted",
  "is_archived",
  "quantity",
  "price",
  "amount",
  "total",
  "type",
  "category_id",
  "status_id",
  "role_id",
  "state",
  "code",
  "nonce",
  "code_verifier",
  "code_challenge",
  "id_token",
  "access_token",
  "refresh_token",
];

// Recursively sanitize all string fields in an object
function sanitizeAllStrings(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;

  if (data instanceof FormData) {
    const sanitizedFormData = new FormData();
    data.forEach((value, key) => {
      if (!EXCLUDE_FIELDS.includes(key) && typeof value === "string") {
        sanitizedFormData.append(key, sanitizeText(value));
      } else {
        sanitizedFormData.append(key, value);
      }
    });
    return sanitizedFormData;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeAllStrings(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (EXCLUDE_FIELDS.includes(key)) {
      sanitized[key] = value;
    } else if (typeof value === "string") {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeAllStrings(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function sanitizationInterceptor(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  if (!config.method || !config.url) return config;

  const method = config.method.toUpperCase();
  if (!["POST", "PUT", "PATCH"].includes(method)) return config;

  if (config.data) {
    config.data = sanitizeAllStrings(config.data);
  }

  return config;
}
