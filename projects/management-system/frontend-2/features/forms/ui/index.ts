export { GenericForm } from "./GenericForm";
export { FormField } from "./FormField";
export type {
  FormSchema,
  FormSection,
  FormField as FormFieldType,
  FieldType,
  FieldPermissions,
  SectionPermissions,
  FieldDependency,
  SelectOption,
  GenericFormProps,
} from "./types";

// Export permission utilities
export {
  useFormPermissions,
  checkFieldPermissions,
  checkSectionPermissions,
  checkPermissionFromAll,
} from "./utils/permissions";
