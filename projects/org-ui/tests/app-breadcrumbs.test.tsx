import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppBreadcrumbs } from '../src';

describe('AppBreadcrumbs', () => {
  it('renders nothing when items is empty', () => {
    const { container } = render(<AppBreadcrumbs items={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders breadcrumb nav with links for items that have href', () => {
    render(
      <AppBreadcrumbs
        items={[
          { id: '1', label: 'Home', href: '/' },
          { id: '2', label: 'Settings', href: '/settings', isCurrent: true },
        ]}
      />
    );

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeInTheDocument();

    const home = screen.getByRole('link', { name: 'Home' });
    expect(home).toHaveAttribute('href', '/');

    const current = screen.getByRole('link', { name: 'Settings' });
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('calls onSelect and prevents default navigation when href and onSelect are set', () => {
    const onSelect = vi.fn();
    render(
      <AppBreadcrumbs
        items={[{ id: 'a', label: 'Org', href: '/org', onSelect }]}
      />
    );

    const link = screen.getByRole('link', { name: 'Org' });
    fireEvent.click(link, { cancelable: true });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(link.getAttribute('href')).toBe('/org');
  });

  it('renders plain text for items without href', () => {
    render(<AppBreadcrumbs items={[{ id: 'x', label: 'Draft', isCurrent: true }]} />);

    expect(screen.queryByRole('link', { name: 'Draft' })).not.toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('uses linkComponent when provided', () => {
    render(
      <AppBreadcrumbs
        items={[{ id: '1', label: 'Dashboard', href: '/dash' }]}
        linkComponent={({ href, children, className, onClick, ...rest }) => (
          <a data-testid="custom-link" href={href} className={className} onClick={onClick} {...rest}>
            {children}
          </a>
        )}
      />
    );

    expect(screen.getByTestId('custom-link')).toHaveTextContent('Dashboard');
    expect(screen.getByTestId('custom-link')).toHaveAttribute('href', '/dash');
  });

  it('renders toolbar on the right when provided', () => {
    render(
      <AppBreadcrumbs
        items={[{ id: '1', label: 'Jobs', href: '/jobs' }]}
        toolbar={<button type="button">Extra action</button>}
      />
    );

    expect(screen.getByRole('button', { name: 'Extra action' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });
});
