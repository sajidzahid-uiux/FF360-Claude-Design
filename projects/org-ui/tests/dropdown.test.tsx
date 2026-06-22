import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dropdown } from '../src';

describe('Dropdown', () => {
  it('opens and selects an option', () => {
    const onChange = vi.fn();

    render(
      <Dropdown
        label="Country"
        value="lb"
        onChange={onChange}
        options={[
          { value: 'lb', label: 'Lebanon' },
          { value: 'fr', label: 'France' },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button', { name: 'France' }));
    expect(onChange).toHaveBeenCalledWith('fr');
  });
});
