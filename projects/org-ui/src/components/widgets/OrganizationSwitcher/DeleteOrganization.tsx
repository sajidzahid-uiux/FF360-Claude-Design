import { ButtonVariantEnum } from '../../../constants';
import { Button } from '../../ui-components/Button';

export interface DeleteOrganizationProps {
  title?: string;
  description?: string;
  deleteLabel?: string;
  noPermissionLabel?: string;
  canDelete?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onDelete?: () => void;
}

export const DeleteOrganization = ({
  title = 'Danger zone',
  description = 'Deleting this organization is permanent and cannot be undone. All data including clients, fields, and jobs will be permanently removed.',
  deleteLabel = 'Delete organization',
  canDelete = true,
  loading = false,
  disabled = false,
  onDelete,
}: DeleteOrganizationProps) => {
  if (!canDelete) {
    return null;
  }

  return (
    <section className="border-border-subtle bg-bg-surface-elevated border-l-[3px] border-l-[var(--color-feedback-error)] rounded-2xl border p-6">
      <h2 className="text-lg font-semibold text-[var(--color-feedback-error)]">{title}</h2>
      <p className="text-text-secondary mt-2 max-w-4xl">{description}</p>
      <Button
        variant={ButtonVariantEnum.DANGER}
        className="mt-4"
        onClick={onDelete}
        title={deleteLabel}
        loading={loading}
        disabled={disabled || !onDelete}
      />
    </section>
  );
};
