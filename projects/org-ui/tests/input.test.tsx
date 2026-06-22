import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../src';

describe('Input', () => {
  it('renders array helperText as multiple lines', () => {
    render(
      <Input
        label="Accent hex"
        helperText={['Format: #RRGGBB', 'Example: #DFFF86']}
      />
    );

    expect(screen.getByLabelText('Accent hex')).toBeInTheDocument();
    expect(screen.getByText('Format: #RRGGBB')).toBeInTheDocument();
    expect(screen.getByText('Example: #DFFF86')).toBeInTheDocument();
  });
});
