import { CONTACT_SUBTYPE } from "@/entities/contact/model/constants";
import { labelVariants } from "@/shared/ui/primitives/label";

export { CONTACT_SUBTYPE };

export const CLIENT_CONTACT_CATEGORY_NAME = "Client Contact";

/** contacts-v2 list filters for the sub-contact search picker. */
export const SUB_CONTACT_PICKER_LIST_FILTERS = {
  contact_subtype: CONTACT_SUBTYPE.STANDARD,
  unlinked_only: true,
} as const;

export const MAX_SUB_CONTACTS = 10;

export const FARM_MANAGEMENT_CONTACT_LABEL = "Farm Management Contact";

export const CONTACT_TYPE_LABELS = {
  standard: "Single Contact",
  farm_management: FARM_MANAGEMENT_CONTACT_LABEL,
} as const;

export const ADD_FARM_CONTACT_TITLE = `Add New ${FARM_MANAGEMENT_CONTACT_LABEL}`;
export const FARM_CONTACT_BADGE_LABEL = FARM_MANAGEMENT_CONTACT_LABEL;

export const FARM_CONTACT_INFO_TAB = `${FARM_MANAGEMENT_CONTACT_LABEL} Information`;
export const SUB_CONTACTS_TAB = "Sub-Contacts";

export const SUB_CONTACTS_LINK_DESCRIPTION = `Link single contacts to this ${FARM_MANAGEMENT_CONTACT_LABEL}.`;

export const SUB_CONTACTS_PENDING_DESCRIPTION = `${SUB_CONTACTS_LINK_DESCRIPTION} Sub-contacts will be connected when you submit the ${FARM_MANAGEMENT_CONTACT_LABEL} form.`;

/** Farm Management Contact form field labels. */
export const FARM_FORM_FIELD_LABEL_CLASS = labelVariants({
  variant: "formMedium",
});

/** User-facing term for farm records (singular / plural). Change here to rename app-wide. */
export const ON_SITE_OPERATION_LABEL = "On-Site Operation";
export const ON_SITE_OPERATIONS_LABEL = "On-Site Operations";
