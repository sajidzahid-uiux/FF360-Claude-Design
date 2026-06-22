import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '../src/theme';
import { OrganizationCard } from '../src/components/widgets/OrganizationSwitcher/OrganizationCard';

describe('OrganizationCard', () => {
  it('renders user status and organization plan', () => {
    render(
      <ThemeProvider>
        <OrganizationCard
          item={{
            id: 1,
            name: 'CMS Org',
            user_type: 'Manager',
            current_plan: 'Pro',
          }}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Plan: Pro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});
