/**
 * Row from GET /ms/organizations/ (org list / switcher).
 * Shape confirmed via runtime probe (ShowMoreCard org context).
 */
export interface OrganizationListRow {
  id: number;
  role?: string | null;
  name: string;
  email: string;
  phone_number: string;
  company_abbreviation: string;
  logo: string;
  address: string;
  longitude: number;
  latitude: number;
  current_plan: string;
}
