"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  type Column,
  createDefaultColumnPreferences,
  mergeColumnPreferences,
  type TableColumnPreferences,
  type TableVariant,
  TableVariantEnum,
  type UseTablePreferencesResult,
  useTablePreferences,
} from "@fieldflow360/org-ui";

import { getItem, removeItem, setItem } from "@/utils/persistentStorage";

export type LeadColumnSaveScope = "user" | "org";
export type LeadColumnActiveScope = LeadColumnSaveScope | "default";

interface StoredLeadColumnLayout {
  preferences: TableColumnPreferences;
  variant?: TableVariant;
}

export interface UseLeadColumnPreferencesOptions {
  /** Lead type the table belongs to (repair / excavation / tiling) — scopes the saved layout. */
  leadType: string;
  organizationId?: string | number | null;
  userId?: string | null;
  defaultVariant?: TableVariant;
}

export interface UseLeadColumnPreferencesResult<
  T extends { id: string | number },
> extends UseTablePreferencesResult<T> {
  /** Persist the current layout for the given scope (org scope is admin-gated by the caller). */
  saveForScope: (scope: LeadColumnSaveScope) => void;
  /** Remove this user's saved layout and fall back to the org default / built-in defaults. */
  resetToDefault: () => void;
  hasUserPreference: boolean;
  hasOrgPreference: boolean;
  /** Which saved layout the table currently reflects on load. */
  activeScope: LeadColumnActiveScope;
  /** Current layout differs from the saved baseline (i.e. there is something worth saving). */
  isDirty: boolean;
}

const KEY_PREFIX = "leadCols";

/** localStorage keys must match /^[a-zA-Z][a-zA-Z0-9_-]{0,99}$/ — strip everything else. */
function sanitizeKeyPart(part: string | number | null | undefined): string {
  return String(part ?? "x")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 40);
}

function buildStorageKey(
  scope: LeadColumnSaveScope,
  leadType: string,
  organizationId: string | number | null | undefined,
  userId: string | null | undefined
): string {
  const base = `${KEY_PREFIX}_${sanitizeKeyPart(leadType)}_org${sanitizeKeyPart(
    organizationId
  )}`;
  return scope === "org"
    ? `${base}_orgdefault`
    : `${base}_user${sanitizeKeyPart(userId)}`;
}

function readLayout(key: string): StoredLeadColumnLayout | null {
  const raw = getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredLeadColumnLayout;
    if (
      parsed?.preferences &&
      Array.isArray(parsed.preferences.order) &&
      Array.isArray(parsed.preferences.hiddenKeys)
    ) {
      return parsed;
    }
  } catch {
    // Ignore corrupt entries — fall through to defaults.
  }
  return null;
}

function serializeLayout(
  preferences: TableColumnPreferences,
  variant: TableVariant
): string {
  return JSON.stringify({ preferences, variant });
}

/**
 * Column visibility preferences for the lead tables, persisted to localStorage
 * independently per lead type. Unlike org-ui's auto-saving `useTablePreferences`,
 * editing the layout is live-but-ephemeral until the user explicitly saves it for
 * themselves or (admin only) as the organization default.
 *
 * Load precedence: this user's saved layout → org default → built-in column defaults.
 */
export function useLeadColumnPreferences<T extends { id: string | number }>(
  columns: Column<T>[],
  {
    leadType,
    organizationId,
    userId,
    defaultVariant = TableVariantEnum.PLAIN,
  }: UseLeadColumnPreferencesOptions
): UseLeadColumnPreferencesResult<T> {
  // No storageKey: we own persistence so we can offer explicit user/org saves.
  const base = useTablePreferences(columns, { defaultVariant });

  const userKey = buildStorageKey("user", leadType, organizationId, userId);
  const orgKey = buildStorageKey("org", leadType, organizationId, userId);

  const [hasUserPreference, setHasUserPreference] = useState(false);
  const [hasOrgPreference, setHasOrgPreference] = useState(false);
  const [baseline, setBaseline] = useState("");

  // Keep latest hook handles in refs so the load effect depends only on the keys.
  const setPreferencesRef = useRef(base.setPreferences);
  const setVariantRef = useRef(base.setVariant);
  const definitionsRef = useRef(base.definitions);
  setPreferencesRef.current = base.setPreferences;
  setVariantRef.current = base.setVariant;
  definitionsRef.current = base.definitions;

  // Resolve the saved layout whenever the identity (lead type / org / user) changes.
  useEffect(() => {
    const userStored = readLayout(userKey);
    const orgStored = readLayout(orgKey);
    const resolved = userStored ?? orgStored;
    const variant = resolved?.variant ?? defaultVariant;
    const preferences = resolved
      ? mergeColumnPreferences(resolved.preferences, definitionsRef.current)
      : createDefaultColumnPreferences(definitionsRef.current);

    setPreferencesRef.current(preferences);
    setVariantRef.current(variant);
    setHasUserPreference(Boolean(userStored));
    setHasOrgPreference(Boolean(orgStored));
    setBaseline(serializeLayout(preferences, variant));
    // defaultVariant is stable; keyed on identity only to avoid clobbering live edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userKey, orgKey]);

  const saveForScope = useCallback(
    (scope: LeadColumnSaveScope) => {
      const key = scope === "org" ? orgKey : userKey;
      const layout: StoredLeadColumnLayout = {
        preferences: base.preferences,
        variant: base.variant,
      };
      setItem(key, JSON.stringify(layout));

      if (scope === "org") {
        setHasOrgPreference(true);
        // The org default only becomes this user's baseline when they have no
        // personal layout of their own.
        if (!hasUserPreference) {
          setBaseline(serializeLayout(base.preferences, base.variant));
        }
      } else {
        setHasUserPreference(true);
        setBaseline(serializeLayout(base.preferences, base.variant));
      }
    },
    [base.preferences, base.variant, hasUserPreference, orgKey, userKey]
  );

  const resetToDefault = useCallback(() => {
    removeItem(userKey);
    const orgStored = readLayout(orgKey);
    const variant = orgStored?.variant ?? defaultVariant;
    const preferences = orgStored
      ? mergeColumnPreferences(orgStored.preferences, definitionsRef.current)
      : createDefaultColumnPreferences(definitionsRef.current);

    setPreferencesRef.current(preferences);
    setVariantRef.current(variant);
    setHasUserPreference(false);
    setHasOrgPreference(Boolean(orgStored));
    setBaseline(serializeLayout(preferences, variant));
  }, [defaultVariant, orgKey, userKey]);

  const current = serializeLayout(base.preferences, base.variant);
  const isDirty = baseline !== "" && current !== baseline;

  const activeScope: LeadColumnActiveScope = hasUserPreference
    ? "user"
    : hasOrgPreference
      ? "org"
      : "default";

  return {
    ...base,
    saveForScope,
    resetToDefault,
    hasUserPreference,
    hasOrgPreference,
    activeScope,
    isDirty,
  };
}
