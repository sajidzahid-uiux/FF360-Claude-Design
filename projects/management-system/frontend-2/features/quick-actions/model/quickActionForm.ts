import type { QuickActionCreatePayload } from "@/api/types";

export const QUICK_ACTION_FIELD_LIMITS = {
  name: 100,
  phone_number: 15,
  email: 100,
  description: 500,
} as const;

export type QuickActionFormFieldValues = Required<
  Pick<
    QuickActionCreatePayload,
    "name" | "phone_number" | "email" | "description"
  >
>;

export type QuickActionFormValues = QuickActionFormFieldValues & {
  files: File[];
};

export const DEFAULT_QUICK_ACTION_FORM_VALUES: QuickActionFormValues = {
  name: "",
  phone_number: "",
  email: "",
  description: "",
  files: [],
};

export interface QuickActionEditSubmitPayload {
  values: QuickActionFormValues;
  keptFileIds: number[];
}

export function quickActionToFormValues(quickAction: {
  name?: string | null;
  phone_number?: string | null;
  email?: string | null;
  description?: string | null;
}): QuickActionFormValues {
  return {
    name: quickAction.name ?? "",
    phone_number: quickAction.phone_number ?? "",
    email: quickAction.email ?? "",
    description: quickAction.description ?? "",
    files: [],
  };
}
