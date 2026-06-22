export {
  buildClientsAndFarmsDisplay,
  buildClientsAndFarmsInlineSegments,
  buildClientsAndFarmsInlineText,
  truncateClientsAndFarmsLabel,
} from "./ClientsAndFarmsDisplay";
export type {
  ClientsAndFarmsDisplay,
  ClientsAndFarmsDisplayInput,
  ClientsAndFarmsInlineSegment,
} from "./ClientsAndFarmsDisplay";
export { getFarmManagementIdFromFilters } from "./farmManagementFilter";
export {
  ensureLockedCategoryIds,
  getLockedClientContactCategoryIds,
} from "./contactCategoryLock";
export { fromLocationPoint, toLocationPoint } from "./contact-location";
export {
  addContactDetailRow,
  createDefaultContactDetails,
  createEmptyContactDetailRow,
  formatContactDisplayLabel,
  formatSecondaryContactNames,
  getContactDetailsErrorMessage,
  getPrimaryContactDetail,
  getPrimaryContactDisplayName,
  hydrateContactDetailsForForm,
  mapApiContactDetailsToForm,
  mapContactDetailsToApi,
  normalizeContactDetailRows,
  orderContactDetailsForApiWrite,
  removeContactDetailRow,
  setPrimaryDetail,
  syncLegacyFieldsFromDetails,
  updateContactDetailRow,
  validateContactDetails,
} from "./contactDetails";
export type { ContactDetailFormRow } from "./contactDetails";
export {
  contactDetailRowSchema,
  contactFormCategoryIdsSchema,
  contactFormMapDataSchema,
} from "./contactFormZodSchemas";
export {
  buildContactTableRows,
  isFarmManagementContact,
  toggleExpandedParentId,
} from "./contactTableRows";
export type { ContactTableRow } from "./contactTableRows";
export {
  contactToFarmFormData,
  farmFormDataToUpdatePayload,
  preserveLegacyHomePhone,
} from "./farmContactFormHelpers";
export {
  parseFarmManagementContactRef,
  parseFarmManagementContactRefs,
} from "./farmManagementContactRefs";
export type { ParsedFarmManagementContactRef } from "./farmManagementContactRefs";
export {
  getFarmManagementDisplayNames,
  getFarmManagementExtraCount,
  getPrimaryFarmManagementName,
  normalizeContactInfoForClientsAndFarms,
} from "./farmManagementContactDisplay";
export type { FarmManagementContactSummary } from "./farmManagementContactDisplay";
export {
  contactFormDataToSubContactCreateAndLink,
  mapContactFormVertices,
  subContactCreateAndLinkToContactCreate,
} from "./subContactPayload";
export {
  CONTACTS_CATEGORY_FILTER_ID,
  CONTACTS_NAME_SORT_COLUMN_KEY,
  CONTACTS_SUBTYPE_FILTER_ID,
  contactSortToTableSortRules,
  contactsTableQueryToListParams,
  tableSortRulesToContactSort,
} from "./contacts-table-query";
export {
  CONTACT_DETAIL_TAB_CONTACT,
  CONTACT_DETAIL_TAB_FARMS,
  CONTACT_DETAIL_TAB_JOBS,
  FARM_CONTACT_INFO_TAB,
  SUB_CONTACTS_TAB,
  getContactDetailTabs,
  isClientContact,
} from "./contact-detail-tabs";
export type { ContactInfoWithFarmManagement } from "./farmManagementContactDisplay";
export { buildContactCreatePayload } from "./build-contact-create-payload";
export { buildContactUpdatePayload } from "./build-contact-update-payload";
export {
  contactFormValidation,
  isContactFormSubmittable,
  mapContactFormZodErrors,
} from "./contact-form-validation";
