import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../src';
import { ComponentSizeEnum } from '../src/constants';

describe('Checkbox', () => {
  it('renders label and toggles checked state', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Accept terms" onChange={onChange} />);

    const input = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(input).not.toBeChecked();

    fireEvent.click(input);
    expect(onChange).toHaveBeenCalled();
    expect(input).toBeChecked();
  });

  it('shows error message and sets aria-invalid when error is set', () => {
    render(<Checkbox label="Field" error="Required" />);

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Field' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('does not toggle when disabled', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox label="Locked" disabled checked onChange={onChange} />);

    await user.click(screen.getByRole('checkbox', { name: 'Locked' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders helper text when no error', () => {
    render(
      <Checkbox label="Email" helperText="We never share your email." size={ComponentSizeEnum.LG} />
    );

    expect(screen.getByText('We never share your email.')).toBeInTheDocument();
  });
});
