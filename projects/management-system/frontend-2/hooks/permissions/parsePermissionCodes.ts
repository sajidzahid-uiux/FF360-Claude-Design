import { PERMISSION_RESOURCES } from "./constants";

export enum PageResource {
  TRASH = "trash",
  EQUIPMENT = "equipment",
  SETTINGS = "settings",
  CONTACT = "contact_access",
}

export type PagePermissions = {
  read: boolean;
  write: boolean;
  delete: boolean;
};

export type PermissionCodeMap = Record<string, PagePermissions>;

export function parsePermissionCodes(codes: string[]): PermissionCodeMap {
  const result: PermissionCodeMap = {};
  const validResourceValues = Object.values(PERMISSION_RESOURCES);

  for (const code of codes) {
    // Extract resource and action: "resource_action"
    const parts = code.split("_");
    if (parts.length < 2) continue;

    const action = parts[parts.length - 1] as keyof PagePermissions;
    if (!["read", "write", "delete"].includes(action)) continue;

    const resourceValue = parts.slice(0, -1).join("_");
    if (!validResourceValues.includes(resourceValue)) continue;

    if (!result[resourceValue]) {
      result[resourceValue] = { read: false, write: false, delete: false };
    }
    result[resourceValue][action] = true;
  }

  return result;
}
