import path from "path";
import { describe, expect, it } from "vitest";

import {
  SHARED_SOURCE_PAIRS,
  compareSharedSources,
} from "../sharedSourceParity";

const V1_ROOT = path.resolve(import.meta.dirname, "../../../../../frontend");
const V2_ROOT = path.resolve(import.meta.dirname, "../../../..");

describe("shared source parity (frontend v1 ↔ v2)", () => {
  const results = compareSharedSources(V1_ROOT, V2_ROOT);

  it.each(
    SHARED_SOURCE_PAIRS.map((pair) => [pair.relativePath, pair.description])
  )("%s — %s", (relativePath) => {
    const result = results.find((entry) => entry.relativePath === relativePath);
    expect(result?.v1Exists, `missing in v1: ${relativePath}`).toBe(true);
    expect(result?.v2Exists, `missing in v2: ${relativePath}`).toBe(true);
    expect(result?.match, `drift detected in ${relativePath}`).toBe(true);
  });
});
