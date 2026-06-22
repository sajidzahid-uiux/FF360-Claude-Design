import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ColorPicker } from '../src/components/ui-components/ColorPicker';
import { ThemeProvider } from '../src/theme';

describe('ColorPicker', () => {
  it('renders current value and allows choosing swatches', () => {
    const onChange = vi.fn();
    render(
      <ThemeProvider>
        <ColorPicker value="#DFFF86" onChange={onChange} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Use color #7DD3FC' }));
    expect(onChange).toHaveBeenCalledWith('#7DD3FC');
    expect(screen.getByText('#DFFF86')).toBeInTheDocument();
  });

  it('renders picker only when swatches are hidden', () => {
    render(
      <ThemeProvider>
        <ColorPicker
          value="#DFFF86"
          onChange={() => undefined}
          showSwatches={false}
          showHeader={false}
        />
      </ThemeProvider>
    );

    expect(screen.queryByRole('button', { name: /Use color/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Pick saturation and lightness')).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Hue' })).toBeInTheDocument();
  });

  it('emits custom color from custom controls', () => {
    const onChange = vi.fn();
    render(
      <ThemeProvider>
        <ColorPicker value="#DFFF86" onChange={onChange} />
      </ThemeProvider>
    );

    fireEvent.change(screen.getByRole('slider', { name: 'Hue' }), {
      target: { value: '0' },
    });

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
    expect(typeof lastCall).toBe('string');
    expect(lastCall).toMatch(/^#[0-9A-F]{6}$/);
  });
});
