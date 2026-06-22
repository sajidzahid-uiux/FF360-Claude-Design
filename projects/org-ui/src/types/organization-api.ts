/**
 * Reference shapes for organization payloads from each backend.
 * Consumers may import these for API typing; org-ui normalizes via {@link mapOrganizationToFieldFlow}.
 */

/** GET /ms/organizations/ row (CMS management system). */
export interface CmsOrganizationApiRecord {
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
  user_type?: string | null;
}

/** Tile Design organization (list / detail). */
export interface TileDesignOrganizationApiRecord {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  longitude?: number | null;
  latitude?: number | null;
  logo?: string | null;
  is_active?: boolean;
  is_service_org?: boolean;
  owner?: boolean;
  user_type?: string;
  member_count?: number;
  created_at?: string;
}
