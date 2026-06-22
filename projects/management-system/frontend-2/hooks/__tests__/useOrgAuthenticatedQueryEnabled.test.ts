import { useAuth0 } from "@auth0/auth0-react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDataFromStorageByKey } from "@/hooks/storage-data";

import { useOrgAuthenticatedQueryEnabled } from "../useOrgAuthenticatedQueryEnabled";

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: vi.fn(),
}));

vi.mock("@/hooks/storage-data", () => ({
  StorageKey: { ACCESS_TOKEN: "access_token" },
  useDataFromStorageByKey: vi.fn(),
}));

describe("useOrgAuthenticatedQueryEnabled", () => {
  it("returns false without org, token, or auth session", () => {
    vi.mocked(useAuth0).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    } as ReturnType<typeof useAuth0>);
    vi.mocked(useDataFromStorageByKey).mockReturnValue(null);

    const { result } = renderHook(() => useOrgAuthenticatedQueryEnabled("123"));
    expect(result.current).toBe(false);
  });

  it("returns true when org, token, and auth session are present", () => {
    vi.mocked(useAuth0).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    } as ReturnType<typeof useAuth0>);
    vi.mocked(useDataFromStorageByKey).mockReturnValue("jwt-token");

    const { result } = renderHook(() => useOrgAuthenticatedQueryEnabled("123"));
    expect(result.current).toBe(true);
  });
});
