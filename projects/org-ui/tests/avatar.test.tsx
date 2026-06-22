import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from '../src';

describe('Avatar', () => {
  it('renders fallback text when there is no image src', () => {
    render(<Avatar fallback="ab" alt="User" />);

    expect(screen.getByText('AB')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/a.png" alt="User photo" fallback="X" />);

    const img = screen.getByRole('img', { name: 'User photo' });
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
  });

  it('falls back to initials after image load error', () => {
    render(<Avatar src="https://example.com/broken.png" alt="User" fallback="CD" />);

    const img = screen.getByRole('img', { name: 'User' });
    fireEvent.error(img);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('CD')).toBeInTheDocument();
  });

  it('applies numeric pixel size via style', () => {
    render(<Avatar fallback="Z" size={48} />);

    const slot = document.querySelector('[data-slot="avatar"]');
    expect(slot).not.toBeNull();
    expect(slot).toHaveStyle({ width: '48px', height: '48px' });
  });
});
