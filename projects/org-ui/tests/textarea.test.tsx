import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from '../src';

describe('Textarea', () => {
  it('renders with label and helper text', () => {
    render(
      <Textarea
        label="Description"
        helperText="Optional details"
        placeholder="Enter description"
      />
    );

    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Optional details')).toBeInTheDocument();
  });
});
