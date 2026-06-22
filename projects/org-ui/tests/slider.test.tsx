import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../src/theme';
import { Slider } from '../src/components/ui-components/Slider';

describe('Slider', () => {
  it('renders label and current value', () => {
    render(
      <ThemeProvider>
        <Slider
          label="Layer transparency"
          value={40}
          onChange={() => undefined}
          formatValue={(value) => `${value}%`}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Layer transparency')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('emits numeric value on change', () => {
    const onChange = vi.fn();
    render(
      <ThemeProvider>
        <Slider value={12} onChange={onChange} ariaLabel="Opacity slider" />
      </ThemeProvider>
    );

    fireEvent.change(screen.getByRole('slider', { name: 'Opacity slider' }), {
      target: { value: '55' },
    });

    expect(onChange).toHaveBeenCalledWith(55);
  });
});
