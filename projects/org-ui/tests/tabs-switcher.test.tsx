import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TabsSwitcher } from '../src';

describe('TabsSwitcher', () => {
  it('changes selected tab on click', () => {
    const onChange = vi.fn();

    render(
      <TabsSwitcher
        value="light"
        onChange={onChange}
        items={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'night', label: 'Night' },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Dark' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]).toBe('dark');
    expect(onChange.mock.calls[0]?.[1]).toBeDefined();
  });

  it('uses full-width track layout when fullWidth is set', () => {
    const { container } = render(
      <TabsSwitcher
        fullWidth
        value="light"
        items={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
      />
    );

    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).toHaveClass('w-full');
    expect(tablist).not.toHaveClass('inline-flex');
  });

  it('supports keyboard navigation with arrow keys', () => {
    const onChange = vi.fn();
    const { container } = render(
      <TabsSwitcher
        value="light"
        onChange={onChange}
        items={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'night', label: 'Night' },
        ]}
      />
    );

    const tablist = container.querySelector('[role="tablist"]');
    expect(tablist).not.toBeNull();

    fireEvent.keyDown(tablist!, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('dark');
  });
});
