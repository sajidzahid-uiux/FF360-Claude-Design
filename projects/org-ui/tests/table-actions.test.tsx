import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TableActions } from '../src/components/widgets/TableActions/TableActions';
import { TABLE_ACTIONS_TOUCH_LAYOUT_MEDIA_QUERY } from '../src/components/widgets/TableActions/tableActionsConstants';

const item = { id: 1, name: 'Alpha' };

const actions = [
  { label: 'View', onClick: vi.fn() },
  { label: 'Edit', onClick: vi.fn() },
  { label: 'Delete', onClick: vi.fn(), variant: 'danger' as const },
];

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === TABLE_ACTIONS_TOUCH_LAYOUT_MEDIA_QUERY ? matches : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('TableActions mobile layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses overflow menu on touch layout media query', () => {
    mockMatchMedia(true);

    const { container } = render(<TableActions item={item} actions={actions} />);

    expect(container.querySelector('[data-table-actions-layout="menu"]')).toBeTruthy();
    expect(screen.getByLabelText('Row actions')).toBeInTheDocument();
    expect(container.querySelector('[data-table-actions-layout="inline"]')).toBeNull();
  });

  it('uses inline quick actions on desktop fine pointer', () => {
    mockMatchMedia(false);

    const { container } = render(
      <TableActions item={item} actions={actions} maxVisibleActions={2} />
    );

    expect(container.querySelector('[data-table-actions-layout="inline"]')).toBeTruthy();
    expect(screen.getByLabelText('View')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit')).toBeInTheDocument();
  });

  it('respects collapseOnTouch=false on narrow viewports', () => {
    mockMatchMedia(true);

    const { container } = render(
      <TableActions item={item} actions={actions} collapseOnTouch={false} />
    );

    expect(container.querySelector('[data-table-actions-layout="inline"]')).toBeTruthy();
  });
});
