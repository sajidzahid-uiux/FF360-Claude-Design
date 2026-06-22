import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export interface SharedSourcePair {
  /** Path relative to each frontend root. */
  relativePath: string;
  description: string;
}

/** Modules that must stay byte-identical (or near-identical) between v1 and v2. */
export const SHARED_SOURCE_PAIRS: SharedSourcePair[] = [
  {
    relativePath: "hooks/permissions/constants.ts",
    description: "Permission resource constants",
  },
  {
    relativePath: "features/contacts/lib/contactFormZodSchemas.ts",
    description: "Contact Zod row/map/category schemas",
  },
  {
    relativePath: "utils/validation/contactValidation.ts",
    description: "Phone/zip validation helpers",
  },
  {
    relativePath: "features/jobs/lib/stakeholderPayload.ts",
    description: "Job stakeholder API payload builder",
  },
  {
    relativePath: "features/jobs/lib/jobEquipmentHoursPayload.ts",
    description: "Job equipment hours payload builder",
  },
  {
    relativePath: "features/contacts/lib/subContactPayload.ts",
    description: "Sub-contact create/update payloads",
  },
  {
    relativePath: "utils/notes.ts",
    description: "Notes helpers",
  },
];

function normalizeForCompare(source: string): string {
  return source.replace(/\r\n/g, "\n").trimEnd();
}

export function hashSource(source: string): string {
  return createHash("sha256").update(normalizeForCompare(source)).digest("hex");
}

export interface SharedSourceCompareResult {
  relativePath: string;
  description: string;
  v1Exists: boolean;
  v2Exists: boolean;
  match: boolean;
  v1Hash: string | null;
  v2Hash: string | null;
}

export function compareSharedSources(
  v1Root: string,
  v2Root: string,
  pairs: SharedSourcePair[] = SHARED_SOURCE_PAIRS
): SharedSourceCompareResult[] {
  return pairs.map(({ relativePath, description }) => {
    const v1Path = join(v1Root, relativePath);
    const v2Path = join(v2Root, relativePath);
    const v1Exists = existsSync(v1Path);
    const v2Exists = existsSync(v2Path);

    const v1Hash = v1Exists ? hashSource(readFileSync(v1Path, "utf8")) : null;
    const v2Hash = v2Exists ? hashSource(readFileSync(v2Path, "utf8")) : null;

    return {
      relativePath,
      description,
      v1Exists,
      v2Exists,
      match: v1Hash !== null && v2Hash !== null && v1Hash === v2Hash,
      v1Hash,
      v2Hash,
    };
  });
}
