import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Loader } from '../src';

describe('Loader', () => {
  it('renders accessible loading status with sr-only fallback', () => {
    render(<Loader />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders custom loading text when provided', () => {
    render(<Loader text="Syncing layers..." />);
    expect(screen.getByText('Syncing layers...')).toBeInTheDocument();
  });

  it('centers in a flex parent with mx-auto and my-auto by default', () => {
    render(
      <div data-testid="parent" className="flex min-h-[200px] w-[300px]">
        <Loader />
      </div>
    );

    const loader = screen.getByRole('status');
    expect(loader).toHaveClass('mx-auto');
    expect(loader).toHaveClass('my-auto');
  });

  it('can opt out of container centering classes', () => {
    render(<Loader centerInContainer={false} />);
    const loader = screen.getByRole('status');
    expect(loader).not.toHaveClass('my-auto');
  });
});
