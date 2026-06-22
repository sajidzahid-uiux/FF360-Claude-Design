import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchInput } from '../src';

describe('SearchInput', () => {
  it('renders bordered variant by default', () => {
    render(<SearchInput placeholder="Search" />);
    const input = screen.getByRole('searchbox');

    expect(input.className).toMatch(/rounded-lg/);
    expect(input.className).toMatch(/border-border/);
  });

  it('renders underlined variant without box border', () => {
    render(<SearchInput variant="underlined" placeholder="Search fields" />);
    const input = screen.getByRole('searchbox');

    expect(input.className).toMatch(/border-b/);
    expect(input.className).toMatch(/rounded-none/);
    expect(input.className).toMatch(/bg-transparent/);
    expect(input.className).not.toMatch(/rounded-lg/);
  });
});
