import type { ContactCategory } from "@/api/types";

import { FARM_CONTACT_INFO_TAB, SUB_CONTACTS_TAB } from "../model/constants";

export const CONTACT_DETAIL_TAB_CONTACT = "Contact Information";
export const CONTACT_DETAIL_TAB_FARMS = "Farm Management";
export const CONTACT_DETAIL_TAB_JOBS = "Job History";

export { FARM_CONTACT_INFO_TAB, SUB_CONTACTS_TAB };

const CLIENT_CONTACT_CATEGORY_NAME = "Client Contact";

export function isClientContact(categories: ContactCategory[]): boolean {
  return categories.some(
    (category) => category.name === CLIENT_CONTACT_CATEGORY_NAME
  );
}

export interface ContactDetailTabsOptions {
  isFarmManagement?: boolean;
}

/** Tabs shown on contact detail — farm tab requires farm read permission. */
export function getContactDetailTabs(
  categories: ContactCategory[],
  farmsPermCodes: string[],
  options?: ContactDetailTabsOptions
): string[] {
  if (options?.isFarmManagement) {
    return [FARM_CONTACT_INFO_TAB, SUB_CONTACTS_TAB, CONTACT_DETAIL_TAB_JOBS];
  }

  const tabs = [CONTACT_DETAIL_TAB_CONTACT];

  if (!isClientContact(categories)) {
    return tabs;
  }

  if (farmsPermCodes.includes("read")) {
    tabs.push(CONTACT_DETAIL_TAB_FARMS);
  }

  tabs.push(CONTACT_DETAIL_TAB_JOBS);

  return tabs;
}
