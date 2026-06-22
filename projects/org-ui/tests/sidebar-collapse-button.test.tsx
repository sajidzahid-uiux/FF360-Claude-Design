import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SidebarCollapseButton } from '../src';

describe('SidebarCollapseButton', () => {
  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<SidebarCollapseButton isCollapsed={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('uses expand label when sidebar is collapsed', () => {
    render(<SidebarCollapseButton isCollapsed onToggle={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });
});
