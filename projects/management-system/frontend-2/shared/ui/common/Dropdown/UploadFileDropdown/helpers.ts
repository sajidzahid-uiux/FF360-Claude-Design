import { FileTypePayload } from "./types";

export const createItem = (
  id: string,
  label: string,
  payload: FileTypePayload
): { id: string; label: string; payload: FileTypePayload } => ({
  id,
  label,
  payload,
});

export const createTilingSpecialItem = (special: {
  value?: string;
  label?: string;
  prefix?: string;
}): { id: string; label: string; payload: FileTypePayload } | null => {
  if (typeof special !== "object" || !("value" in special)) {
    return null;
  }

  return {
    id: special.value as string,
    label: special.label as string,
    payload: {
      fileType: "contractor",
      fileName: special.prefix as string,
      isFixedTitle: true,
    },
  };
};
