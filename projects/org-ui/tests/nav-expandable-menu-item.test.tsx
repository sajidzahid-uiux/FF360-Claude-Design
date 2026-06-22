import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeModeEnum } from '../src/constants';
import { NavExpandableMenuItem } from '../src';
import { ThemeProvider } from '../src/theme';

function renderWithTheme(ui: ReactElement) {
  return render(
    <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>{ui}</ThemeProvider>
  );
}

const Icon = (
  <svg data-testid="menu-icon" viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const inactiveItems = [
  {
    id: 'org',
    href: '/settings/organization',
    title: 'Organization settings',
    icon: Icon,
    isActive: false,
  },
  {
    id: 'user',
    href: '/settings/user',
    title: 'User settings',
    icon: Icon,
    isActive: false,
  },
];

const itemsWithActiveChild = [
  ...inactiveItems.slice(0, 1),
  { ...inactiveItems[1], isActive: true },
];

describe('NavExpandableMenuItem', () => {
  it('renders a toggle button with the group title', () => {
    renderWithTheme(
      <NavExpandableMenuItem
        id="tools"
        title="Tools"
        icon={Icon}
        items={inactiveItems}
        defaultExpanded={false}
        expandWhenChildActive={false}
      />
    );

    expect(screen.getByRole('button', { name: /Tools/i })).toBeInTheDocument();
  });

  it('hides child links when collapsed by default', () => {
    renderWithTheme(
      <NavExpandableMenuItem
        id="tools"
        title="Tools"
        icon={Icon}
        items={inactiveItems}
        defaultExpanded={false}
        expandWhenChildActive={false}
      />
    );

    expect(screen.queryByRole('link', { name: 'Organization settings' })).not.toBeInTheDocument();
  });

  it('shows child links when expanded', () => {
    renderWithTheme(
      <NavExpandableMenuItem
        id="tools"
        title="Tools"
        icon={Icon}
        items={inactiveItems}
        isExpanded
      />
    );

    expect(screen.getByRole('link', { name: 'Organization settings' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'User settings' })).toBeInTheDocument();
  });

  it('toggles expansion in uncontrolled mode', () => {
    const onExpandedChange = vi.fn();

    renderWithTheme(
      <NavExpandableMenuItem
        id="tools"
        title="Tools"
        icon={Icon}
        items={inactiveItems}
        defaultExpanded={false}
        expandWhenChildActive={false}
        onExpandedChange={onExpandedChange}
      />
    );

    const trigger = screen.getByRole('button', { name: /Tools/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('link', { name: 'User settings' })).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(onExpandedChange).toHaveBeenCalledWith(false);
  });

  it('auto-expands when a child is active by default', () => {
    renderWithTheme(
      <NavExpandableMenuItem
        id="tools"
        title="Tools"
        icon={Icon}
        items={itemsWithActiveChild}
      />
    );

    expect(screen.getByRole('button', { name: /Tools/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'User settings' })).toBeInTheDocument();
  });

  it('highlights the parent when a child is active', () => {
    renderWithTheme(
      <NavExpandableMenuItem
        id="tools"
        title="Tools"
        icon={Icon}
        items={itemsWithActiveChild}
        isExpanded
      />
    );

    const trigger = screen.getByRole('button', { name: /Tools/i });
    expect(trigger.className).toContain('border-l-accent');
  });

  it('hides submenu when sidebar is collapsed', () => {
    renderWithTheme(
      <NavExpandableMenuItem
        id="tools"
        title="Tools"
        icon={Icon}
        items={inactiveItems}
        isCollapsed
        isExpanded
      />
    );

    expect(screen.getByRole('button', { name: 'Tools' })).toHaveAttribute('title', 'Tools');
    expect(screen.queryByRole('group', { name: 'Tools submenu' })).not.toBeInTheDocument();
  });

  it('invokes child onClick handlers', () => {
    const onChildClick = vi.fn();

    renderWithTheme(
      <NavExpandableMenuItem
        id="tools"
        title="Tools"
        icon={Icon}
        isExpanded
        items={[
          {
            id: 'org',
            href: '#organization',
            title: 'Organization settings',
            icon: Icon,
            onClick: (event) => {
              event.preventDefault();
              onChildClick();
            },
          },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('link', { name: 'Organization settings' }));
    expect(onChildClick).toHaveBeenCalledTimes(1);
  });

  it('supports controlled expanded state', () => {
    const onExpandedChange = vi.fn();

    const { rerender } = renderWithTheme(
      <NavExpandableMenuItem
        id="tools"
        title="Tools"
        icon={Icon}
        items={inactiveItems}
        isExpanded={false}
        onExpandedChange={onExpandedChange}
      />
    );

    expect(screen.queryByRole('link', { name: 'User settings' })).not.toBeInTheDocument();

    rerender(
      <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>
        <NavExpandableMenuItem
          id="tools"
          title="Tools"
          icon={Icon}
          items={inactiveItems}
          isExpanded
          onExpandedChange={onExpandedChange}
        />
      </ThemeProvider>
    );

    const submenu = screen.getByRole('group', { name: 'Tools submenu' });
    expect(within(submenu).getByRole('link', { name: 'User settings' })).toBeInTheDocument();
  });
});
