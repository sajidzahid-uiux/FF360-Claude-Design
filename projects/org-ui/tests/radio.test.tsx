import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Radio } from '../src';

describe('Radio', () => {
  it('invokes onChange when the radio is activated', () => {
    const onChange = vi.fn();
    render(<Radio name="plan" value="pro" label="Pro plan" onChange={onChange} />);

    fireEvent.click(screen.getByRole('radio', { name: 'Pro plan' }));
    expect(onChange).toHaveBeenCalled();
  });

  it('can render checked when controlled', () => {
    render(
      <Radio name="plan" value="pro" label="Pro plan" checked readOnly onChange={vi.fn()} />
    );

    expect(screen.getByRole('radio', { name: 'Pro plan' })).toBeChecked();
  });

  it('shows error instead of helper when both could apply', () => {
    render(<Radio name="x" label="Option" helperText="Hint" error="Pick one" />);

    expect(screen.getByText('Pick one')).toBeInTheDocument();
    expect(screen.queryByText('Hint')).not.toBeInTheDocument();
  });

  it('is not checked by default when unchecked', () => {
    render(<Radio name="x" value="a" label="A" />);

    expect(screen.getByRole('radio', { name: 'A' })).not.toBeChecked();
  });
});
