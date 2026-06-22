import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

import { CONTACT_FIELD_LIMITS } from "@/features/contacts/model";

const V1_CONTACT_FORM = path.resolve(
  import.meta.dirname,
  "../../../../../frontend/features/contacts/model/contactForm.ts"
);
const V2_CONTACT_FORM = path.resolve(
  import.meta.dirname,
  "../../../../features/contacts/model/contactForm.ts"
);

function readLimits(filePath: string): Record<string, number> {
  const source = readFileSync(filePath, "utf8");
  const match = source.match(
    /CONTACT_FIELD_LIMITS\s*=\s*\{([\s\S]*?)\}\s*as\s*const/s
  );
  expect(match, `CONTACT_FIELD_LIMITS not found in ${filePath}`).toBeTruthy();

  const limits: Record<string, number> = {};
  const body = match![1];
  for (const line of body.split("\n")) {
    const fieldMatch = line.match(/^\s*(\w+):\s*(\d+)/);
    if (fieldMatch) {
      limits[fieldMatch[1]] = Number(fieldMatch[2]);
    }
  }
  return limits;
}

describe("contact form field limits parity (v1 ↔ v2)", () => {
  it("uses identical CONTACT_FIELD_LIMITS in both frontends", () => {
    expect(readLimits(V1_CONTACT_FORM)).toEqual(readLimits(V2_CONTACT_FORM));
    expect(CONTACT_FIELD_LIMITS).toEqual(readLimits(V2_CONTACT_FORM));
  });
});
