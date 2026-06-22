import { ButtonVariantEnum } from '../../../constants';
import { Button } from '../../ui-components/Button';
import {
  FieldFlowOrganizationSourceEnum,
  mapOrganizationToFieldFlow,
  organizationSourceSupportsLogo,
} from '../../../adapters/organization';
import { OrganizationLogoMark } from './OrganizationLogoMark';

export interface OrganizationInfoData {
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  memberCount?: number | null;
  createdAt?: string | null;
}

export interface OrganizationInfoProps {
  organization: OrganizationInfoData | unknown;
  title?: string;
  editLabel?: string;
  canEdit?: boolean;
  onEdit?: () => void;
  organizationSource?: FieldFlowOrganizationSourceEnum;
  /** When omitted, derived from {@link organizationSource}. */
  showOrganizationLogo?: boolean;
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export const OrganizationInfo = ({
  organization,
  title = 'Organization details',
  editLabel = 'Edit Details',
  canEdit = false,
  onEdit,
  organizationSource,
  showOrganizationLogo,
}: OrganizationInfoProps) => {
  const normalized = mapOrganizationToFieldFlow(organization, organizationSource);
  const supportsLogo =
    showOrganizationLogo ?? organizationSourceSupportsLogo(organizationSource);

  return (
    <section className="border-border-subtle bg-bg-surface-elevated rounded-2xl border p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-text-primary text-lg font-semibold">{title}</h2>
        {canEdit && onEdit ? (
          <Button
            variant={ButtonVariantEnum.SURFACE}
            className="text-sm font-semibold"
            title={editLabel}
            onClick={onEdit}
          />
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-[100px_1fr]">
        <OrganizationLogoMark
          name={normalized.name}
          logo={supportsLogo ? normalized.logo : undefined}
          size={90}
          roundedClassName="rounded-full"
        />

        <dl className="grid gap-y-5 sm:grid-cols-2 sm:gap-x-10">
          <div>
            <dt className="text-text-secondary">Name</dt>
            <dd className="text-text-primary mt-2 truncate font-semibold">{normalized.name || '-'}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Email</dt>
            <dd className="text-text-primary mt-2 truncate font-medium">{normalized.email || '-'}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Phone</dt>
            <dd className="text-text-primary mt-2 truncate font-medium">{normalized.phoneNumber || '-'}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Address</dt>
            <dd className="text-text-primary mt-2 truncate font-medium">{normalized.address || '-'}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Members</dt>
            <dd className="text-text-primary mt-2 truncate font-medium">
              {normalized.memberCount ?? '-'}
            </dd>
          </div>
          <div>
            <dt className="text-text-secondary">Created</dt>
            <dd className="text-text-primary mt-2 truncate font-medium">
              {formatDate(normalized.createdAt)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
};
