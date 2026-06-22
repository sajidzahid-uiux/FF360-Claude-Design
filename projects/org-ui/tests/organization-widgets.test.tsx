import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeleteOrganization } from '../src/components/widgets/OrganizationSwitcher/DeleteOrganization';
import { OrganizationInfo } from '../src/components/widgets/OrganizationSwitcher/OrganizationInfo';

describe('Organization widgets permission behavior', () => {
  it('shows edit action only when OrganizationInfo canEdit is true', () => {
    const onEdit = vi.fn();

    const { rerender } = render(
      <OrganizationInfo
        organization={{ name: 'FieldFlow Org' }}
        canEdit={false}
        onEdit={onEdit}
      />
    );

    expect(screen.queryByRole('button', { name: 'Edit Details' })).not.toBeInTheDocument();

    rerender(
      <OrganizationInfo
        organization={{ name: 'FieldFlow Org' }}
        canEdit
        onEdit={onEdit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit Details' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('does not render delete section when canDelete is false', () => {
    const onDelete = vi.fn();

    render(
      <DeleteOrganization
        canDelete={false}
        onDelete={onDelete}
      />
    );

    expect(screen.queryByText('Danger zone')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete organization' })).not.toBeInTheDocument();
  });

  it('renders delete action when canDelete is true', () => {
    const onDelete = vi.fn();

    render(<DeleteOrganization canDelete onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete organization' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
