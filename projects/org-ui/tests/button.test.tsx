import type { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button, ButtonVariantEnum } from '../src';

describe('Button', () => {
  it('renders title and triggers click', () => {
    const onClick = vi.fn();

    render(<Button title="Save" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders icon-only button without title text', () => {
    render(
      <Button
        iconOnly
        aria-label="Open menu"
        variant={ButtonVariantEnum.GHOST}
        leftIcon={<span data-testid="icon">x</span>}
      />
    );

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByText('Open menu')).not.toBeInTheDocument();
  });

  it('logs error when iconOnly is combined with title at runtime', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Button
        {...({
          iconOnly: true,
          title: 'Bad',
          'aria-label': 'Good',
          leftIcon: <span>x</span>,
        } as unknown as ComponentProps<typeof Button>)}
      />
    );

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('[org-ui/Button]')
    );
    spy.mockRestore();
  });
});
