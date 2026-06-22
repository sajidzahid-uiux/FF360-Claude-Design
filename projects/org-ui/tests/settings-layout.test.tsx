import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FieldFlowSettingsLayout } from '../src/components/system-components/SettingsLayout';
import { ThemeModeEnum } from '../src/constants';
import { ThemeProvider } from '../src/theme';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_event: string, listener: () => void) => {
        listener();
      },
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function renderWithTheme(ui: ReactElement) {
  return render(
    <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>{ui}</ThemeProvider>
  );
}

const baseConfig = {
  user: {
    id: 'user-settings',
    title: 'User Settings',
    links: [
      {
        id: 'appearance',
        title: 'Appearance',
        href: '/settings/user/appearance',
        isActive: false,
      },
      {
        id: 'theme-tokens',
        title: 'Theme Tokens',
        href: '/settings/user/theme-tokens',
        isActive: true,
      },
    ],
  },
};

describe('FieldFlowSettingsLayout mobile', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    mockMatchMedia(false);
  });

  it('renders desktop sidebar and content together', () => {
    renderWithTheme(
      <FieldFlowSettingsLayout config={baseConfig}>
        <div>Settings page body</div>
      </FieldFlowSettingsLayout>
    );

    expect(screen.getByRole('complementary', { name: 'Settings sections' })).toBeInTheDocument();
    expect(screen.getByText('Settings page body')).toBeVisible();
    expect(screen.getByText('Appearance')).toBeVisible();
  });

  it('shows mobile nav list when no setting is active', () => {
    mockMatchMedia(true);

    renderWithTheme(
      <FieldFlowSettingsLayout
        config={{
          user: {
            id: 'user-settings',
            title: 'User Settings',
            links: [
              {
                id: 'appearance',
                title: 'Appearance',
                href: '/settings/user/appearance',
              },
            ],
          },
        }}
      >
        <div>Settings page body</div>
      </FieldFlowSettingsLayout>
    );

    const mobileNav = screen.getByTestId('ff-settings-mobile-nav');
    expect(within(mobileNav).getByText('Settings')).toBeInTheDocument();
    expect(within(mobileNav).getByRole('link', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.queryByTestId('ff-settings-content')).not.toBeInTheDocument();
  });

  it('shows mobile detail view when a setting is active', () => {
    mockMatchMedia(true);

    renderWithTheme(
      <FieldFlowSettingsLayout config={baseConfig}>
        <div>Settings page body</div>
      </FieldFlowSettingsLayout>
    );

    const detailHeader = screen.getByTestId('ff-settings-mobile-detail-header');
    expect(within(detailHeader).getByRole('button', { name: 'Back to User Settings' })).toBeInTheDocument();
    expect(within(detailHeader).queryByText('Theme Tokens')).not.toBeInTheDocument();
    expect(screen.getByTestId('ff-settings-content')).toBeVisible();
    expect(screen.queryByTestId('ff-settings-mobile-nav')).not.toBeInTheDocument();
  });

  it('uses section id fallback for mobile back label when section title is empty', () => {
    mockMatchMedia(true);

    renderWithTheme(
      <FieldFlowSettingsLayout
        config={{
          organization: {
            id: 'organization-settings',
            title: '',
            links: [
              {
                id: 'organization-info',
                title: 'Organization Info',
                href: '/settings/organization/organization-info',
                isActive: true,
              },
            ],
          },
        }}
      >
        <div>Settings page body</div>
      </FieldFlowSettingsLayout>
    );

    expect(
      screen.getByRole('button', { name: 'Back to Organization Settings' })
    ).toBeInTheDocument();
  });

  it('returns to mobile nav list when back is pressed', () => {
    mockMatchMedia(true);

    renderWithTheme(
      <FieldFlowSettingsLayout config={baseConfig}>
        <div>Settings page body</div>
      </FieldFlowSettingsLayout>
    );

    fireEvent.click(
      within(screen.getByTestId('ff-settings-mobile-detail-header')).getByRole('button', {
        name: 'Back to User Settings',
      })
    );

    const mobileNav = screen.getByTestId('ff-settings-mobile-nav');
    expect(within(mobileNav).getByRole('link', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.queryByTestId('ff-settings-content')).not.toBeInTheDocument();
  });
});
