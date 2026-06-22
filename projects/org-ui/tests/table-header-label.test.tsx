import { render, screen } from '@testing-library/react';
import { User } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { TableHeaderLabel } from '../src/components/widgets/Table/TableHeaderLabel';

describe('TableHeaderLabel', () => {
  it('renders label text with a Lucide icon component', () => {
    render(<TableHeaderLabel icon={User} label="Contact Name" />);

    expect(screen.getByText('Contact Name')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('applies truncate classes when requested', () => {
    const { container } = render(
      <TableHeaderLabel icon={User} label="Long Column" truncate />
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass('truncate');
    expect(screen.getByText('Long Column')).toHaveClass('truncate');
  });

  it('renders label only when icon is omitted', () => {
    const { container } = render(<TableHeaderLabel label="Status" truncate />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders a pre-rendered icon node', () => {
    render(
      <TableHeaderLabel
        icon={<User aria-hidden data-testid="custom-icon" strokeWidth={2} />}
        label="Status"
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
