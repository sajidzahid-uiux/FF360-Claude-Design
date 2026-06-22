import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from '../src';

describe('Toggle', () => {
  it('calls onChange with toggled value when clicked', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} label="Notifications" />);

    fireEvent.click(screen.getByRole('switch', { name: 'Notifications' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reflects aria-checked from checked prop', () => {
    render(<Toggle checked onChange={vi.fn()} aria-label="Power" />);

    expect(screen.getByRole('switch', { name: 'Power' })).toHaveAttribute('aria-checked', 'true');
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} disabled label="Locked" />);

    fireEvent.click(screen.getByRole('switch', { name: 'Locked' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders helper text below the switch', () => {
    render(
      <Toggle checked={false} onChange={vi.fn()} label="Beta" helperText="Experimental feature." />
    );

    expect(screen.getByText('Experimental feature.')).toBeInTheDocument();
  });
});
